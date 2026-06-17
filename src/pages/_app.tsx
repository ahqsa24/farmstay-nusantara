import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Component {...pageProps} />
        <ChatbotWidget />
      </ToastProvider>
    </AuthProvider>
  );
}
