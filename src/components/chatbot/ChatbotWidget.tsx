import React, { useEffect, useRef, useState } from "react";
import { guideService } from "@/services/guideService";
import chatbotService from "@/services/chatbotService";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { GuideSection, FaqItem } from "@/types/guide";
import { ChatbotConfig } from "@/types/chatbot";

type ChatRole = "bot" | "user";

interface ChatMessage {
  id: number;
  role: ChatRole;
  text: string;
  shouldAnimate?: boolean;
}

const CONTACT_KEYWORDS = ["hubungi", "kontak", "contact", "whatsapp", "wa", "nomor", "telepon", "call"];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value).split(" ").filter(Boolean);
}

function scoreMatch(query: string, source: string) {
  const normalizedQuery = normalizeText(query);
  const normalizedSource = normalizeText(source);

  if (!normalizedQuery || !normalizedSource) {
    return 0;
  }

  if (normalizedSource.includes(normalizedQuery)) {
    return normalizedQuery.length + 10;
  }

  const queryTokens = tokenize(query);
  const sourceTokens = new Set(tokenize(source));
  let score = 0;

  queryTokens.forEach((token) => {
    if (sourceTokens.has(token)) {
      score += 3;
    } else if (token.length > 3) {
      [...sourceTokens].forEach((candidate) => {
        if (candidate.includes(token) || token.includes(candidate)) {
          score += 1;
        }
      });
    }
  });

  return score;
}

function formatWhatsAppLink(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function buildAnswer(query: string, sections: GuideSection[], faqs: FaqItem[], config: ChatbotConfig, locale: string) {
  const contactQuery = normalizeText(query);
  const wantsContact = CONTACT_KEYWORDS.some((keyword) => contactQuery.includes(keyword));

  const faqMatch = faqs
    .map((faq) => ({
      item: faq,
      score: scoreMatch(query, `${faq.question} ${faq.answer}`),
    }))
    .sort((left, right) => right.score - left.score)[0];

  const sectionMatch = sections
    .map((section) => ({
      item: section,
      score: scoreMatch(query, `${section.title} ${section.content}`),
    }))
    .sort((left, right) => right.score - left.score)[0];

  const bestFaqScore = faqMatch?.score || 0;
  const bestSectionScore = sectionMatch?.score || 0;
  const contactLink = formatWhatsAppLink(config.whatsappNumber, locale === "id" ? "Halo, saya butuh bantuan dari chatbot Farmstay Nusantara." : "Hello, I need help from the Farmstay Nusantara chatbot.");

  if (wantsContact) {
    return {
      text: locale === "id"
        ? `Silakan hubungi narahubung WhatsApp kami${contactLink ? ` di ${config.whatsappNumber}` : ""}.`
        : `Please contact our WhatsApp representative${contactLink ? ` at ${config.whatsappNumber}` : ""}.`,
      link: contactLink,
    };
  }

  if (bestFaqScore >= 4 && faqMatch?.item) {
    return {
      text: faqMatch.item.answer,
      source: locale === "id" ? "FAQ" : "FAQ",
    };
  }

  if (bestSectionScore >= 4 && sectionMatch?.item) {
    return {
      text: sectionMatch.item.content,
      source: locale === "id" ? "Panduan" : "Guide",
    };
  }

  if (bestFaqScore > 0 && faqMatch?.item) {
    return {
      text: faqMatch.item.answer,
      source: locale === "id" ? "FAQ" : "FAQ",
    };
  }

  if (bestSectionScore > 0 && sectionMatch?.item) {
    return {
      text: sectionMatch.item.content,
      source: locale === "id" ? "Panduan" : "Guide",
    };
  }

  return {
    text: config.fallbackMessage,
    link: contactLink,
  };
}

const TypewriterText = ({ text, speed = 20, onComplete, scrollRef }: { text: string; speed?: number; onComplete?: () => void; scrollRef?: React.RefObject<HTMLDivElement | null> }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;

      // Auto-scroll slightly as it types
      if (scrollRef?.current) {
        scrollRef.current.scrollIntoView({ behavior: "auto" });
      }

      if (index >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, scrollRef, onComplete]);

  return <>{displayedText}</>;
};

export default function ChatbotWidget() {
  const { user } = useAuth();
  const { locale } = useTranslation();
  const currentLocale = locale ?? "id";
  const isId = currentLocale === "id";
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(1);

  useEffect(() => {
    const loadChatbot = async () => {
      const role = user?.role === "owner" ? "owner" : user?.role === "visitor" ? "visitor" : "all";

      try {
        const [configRes, guideRes, faqRes] = await Promise.all([
          chatbotService.getConfig(),
          guideService.getGuideSections(role),
          guideService.getFaqItems(role),
        ]);

        if (configRes.status === "success" && configRes.data) {
          setConfig(configRes.data);
        }
        if (guideRes.status === "success" && guideRes.data) {
          setSections(guideRes.data);
        }
        if (faqRes.status === "success" && faqRes.data) {
          setFaqs(faqRes.data);
        }
      } catch (error) {
        console.error("Failed to load chatbot data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatbot();
  }, [user]);

  useEffect(() => {
    if (!config || !config.isEnabled) return;
    if (messages.length === 0) {
      setMessages([
        {
          id: messageIdRef.current++,
          role: "bot",
          text: `${config.welcomeTitle}\n\n${config.welcomeMessage}`,
        },
      ]);
    }
  }, [config, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  if (isLoading || !config || !config.isEnabled) {
    return null;
  }

  const quickActions = [
    ...(faqs.slice(0, 2).map((faq) => faq.question)),
    ...(sections.slice(0, 2).map((section) => section.title)),
  ].slice(0, 4);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: messageIdRef.current++, role: "user", text: trimmed },
    ]);

    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const answer = buildAnswer(trimmed, sections, faqs, config, currentLocale);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: messageIdRef.current++, role: "bot", text: answer.text, shouldAnimate: true },
      ]);
    }, 1500); // Animasi mikir 1.5 detik
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isTyping) return; // Prevent sending while bot is thinking
    sendMessage(input);
  };

  const openContact = () => {
    const link = formatWhatsAppLink(
      config.whatsappNumber,
      isId ? "Halo, saya butuh bantuan dari chatbot Farmstay Nusantara." : "Hello, I need help from the Farmstay Nusantara chatbot."
    );

    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-farm-border bg-farm-cream shadow-[0_24px_80px_rgba(18,42,35,0.18)]">
          <div className="bg-[#122A23] px-4 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Farmstay Bot</p>
                <h3 className="mt-1 font-serif text-lg font-bold">{config.welcomeTitle}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/75">{config.welcomeMessage}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4 scroll-smooth">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${message.role === "user" ? "bg-farm-green text-white" : "bg-white text-farm-text border border-farm-border"}`}>
                  {message.shouldAnimate ? (
                    <TypewriterText text={message.text} scrollRef={bottomRef} />
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-white border border-farm-border flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-farm-green/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-farm-green/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-farm-green/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-farm-border bg-white px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button key={action} onClick={() => sendMessage(action)} className="rounded-full border border-farm-border px-3 py-1.5 text-[11px] font-semibold text-farm-text transition-colors hover:border-farm-green hover:text-farm-green">
                  {action}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={isId ? "Tulis pertanyaan singkat..." : "Type a short question..."}
                rows={2}
                className="min-h-[48px] flex-1 resize-none rounded-2xl border border-farm-border bg-farm-beige px-3 py-2 text-sm text-farm-text outline-none transition-colors placeholder:text-farm-text-light focus:border-farm-green"
              />
              <button type="submit" disabled={isTyping} className="h-12 shrink-0 rounded-2xl bg-farm-green px-4 text-sm font-bold text-white transition-colors hover:bg-farm-green-hover disabled:opacity-50 disabled:cursor-not-allowed">
                {isId ? "Kirim" : "Send"}
              </button>
            </form>

            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-farm-text-light">
              <button onClick={openContact} className="font-semibold text-farm-green hover:underline">
                {isId ? "Hubungi WhatsApp" : "Contact WhatsApp"}
              </button>
              <span>{isId ? "Jawaban singkat berbasis Guide & FAQ" : "Short answers powered by Guide & FAQ"}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-farm-green text-white shadow-[0_16px_40px_rgba(18,42,35,0.28)] transition-all duration-300 hover:scale-105 hover:bg-farm-green-hover"
        aria-label={isOpen ? (isId ? "Tutup chatbot" : "Close chatbot") : (isId ? "Buka chatbot" : "Open chatbot")}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 10.5h7.5A2.25 2.25 0 0118 12.75v3.75A2.25 2.25 0 0115.75 18.75H8.25A2.25 2.25 0 016 16.5v-3.75A2.25 2.25 0 018.25 10.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9V7.5a2.25 2.25 0 114.5 0V9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 14.25h.008v.008H9.75v-.008zm4.5 0h.008v.008h-.008v-.008z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75V21" />
          </svg>
        )}
      </button>
    </div>
  );
}