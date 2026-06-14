import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { Playfair_Display } from "next/font/google";
import { useTranslation } from "@/hooks/useTranslation";
import ScrollReveal from "@/components/ScrollReveal";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export default function Home() {
  const { t, locale, router } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (newLocale: "en" | "id") => {
    router.push(router.asPath, router.asPath, { locale: newLocale, scroll: false });
  };

  const navLinks = t.nav.home ? [
    { label: t.nav.home, href: "#home" },
    { label: t.nav.about, href: "#about" },
    { label: t.nav.who, href: "#who" },
    { label: t.nav.features, href: "#features" },
  ] : [];

  const whoIcons = [
    // Icon 1 (Farm Owners)
    <svg key="1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 9M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h3.75m-8.25-12h3" />
    </svg>,
    // Icon 2 (Eco-Travelers)
    <svg key="2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>,
    // Icon 3 (Consultants)
    <svg key="3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9c2.785 0 5.5-2.023 6.23-4.406a60.45 60.45 0 00-.492-6.347m-13.48 0a48.667 48.667 0 0113.48 0m-13.48 0L3.5 14l-.841-.336a1.618 1.618 0 01-.796-2.181l.836-2.09A1.618 1.618 0 014.88 8.242l.216.088m13.48 1.817L19.5 14l.841-.336a1.618 1.618 0 00.796-2.181l-.836-2.09a1.618 1.618 0 00-2.18-1.077l-.216.088M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ];

  return (
    <div
      className={`${playfair.variable} font-sans bg-farm-beige text-farm-text min-h-screen selection:bg-farm-green selection:text-white`}
    >
      <Head>
        <title>
          {locale === "id"
            ? "Farmstay Nusantara — Gerbang Eco-Agrowisata Berkelanjutan"
            : "Farmstay Nusantara — Gateway to Eco-Agritourism"}
        </title>
      </Head>
      {/* 1. Header/Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-farm-beige/90 border-b border-farm-border/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-serif text-2xl font-bold tracking-tight text-farm-green">
              {t.common.brand}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-farm-green transition-colors py-2 relative group text-farm-text/80"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-farm-green transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Action Buttons (Language Toggle & Login) */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Language Switcher - Always Visible next to Login on mobile and desktop */}
            <div className="flex items-center border border-farm-border rounded-full p-0.5 bg-farm-cream scale-90 sm:scale-100">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                  locale === "en"
                    ? "bg-farm-green text-white shadow-sm"
                    : "text-farm-text/60 hover:text-farm-text"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage("id")}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                  locale === "id"
                    ? "bg-farm-green text-white shadow-sm"
                    : "text-farm-text/60 hover:text-farm-text"
                }`}
              >
                ID
              </button>
            </div>

            {/* Login button */}
            <Link
              href="/auth/login"
              className="inline-flex h-9 sm:h-10 items-center justify-center rounded-full bg-farm-green px-4 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-farm-green-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.common.login}
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-farm-text hover:text-farm-green transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-farm-beige border-b border-farm-border/80 shadow-lg px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-medium text-base hover:text-farm-green py-1 border-b border-farm-border/30"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 sm:py-24 px-6">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_bg.png"
            alt="Beautiful Indonesian Agritourism farm stay"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-farm-green-dark/80 via-farm-green-dark/65 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content Column */}
          <div className="lg:col-span-8 text-white flex flex-col gap-6 sm:max-w-2xl text-center lg:text-left items-center lg:items-start">
            <ScrollReveal animation="slide-up" duration={800}>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight drop-shadow-md">
                {t.hero.title}
                <span className="block text-farm-gold mt-1 font-serif font-semibold">
                  {t.hero.subtitle}
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-zinc-100 max-w-xl leading-relaxed drop-shadow-sm font-light mt-4">
                {t.hero.description}
              </p>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={200} duration={800} className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 w-full sm:w-auto">
                <Link
                  href="/auth/register?role=owner"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-farm-green px-8 text-sm sm:text-base font-semibold text-white shadow-lg shadow-black/25 transition-all hover:bg-farm-green-hover hover:scale-[1.03] active:scale-[0.98] text-center"
                >
                  {t.hero.btnPrimary}
                </Link>
                <Link
                  href="/farmstays"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-white/10 border border-white/30 px-8 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.03] active:scale-[0.98] text-center"
                >
                  {t.hero.btnSecondary}
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Wooden Signboard Card Column */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end w-full">
            <ScrollReveal animation="zoom-in" delay={400} duration={900}>
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] rounded-2xl border-4 border-amber-900/60 bg-amber-950/85 text-amber-50 p-5 sm:p-6 shadow-2xl flex flex-col items-center justify-center gap-4 text-center transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Chains hanger illustration */}
                <div className="absolute -top-12 left-1/4 w-1.5 h-12 bg-zinc-400/80 border-r border-zinc-500 rounded-full hidden lg:block" />
                <div className="absolute -top-12 right-1/4 w-1.5 h-12 bg-zinc-400/80 border-r border-zinc-500 rounded-full hidden lg:block" />
                
                <div className="border border-amber-800/40 w-full py-6 px-4 rounded-lg bg-amber-900/20">
                  <span className="font-serif text-amber-300 uppercase tracking-widest text-[10px] font-semibold block mb-1">
                    Established 2026
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    {t.hero.boardWelcome}
                  </h3>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 3. About Section */}
      <section id="about" className="py-20 sm:py-24 bg-farm-cream border-b border-farm-border/40 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Image with Quote badge */}
          <div className="lg:col-span-5 relative flex justify-center pb-8 lg:pb-0">
            <ScrollReveal animation="slide-right" duration={800} className="w-full max-w-sm">
              <div className="relative w-full aspect-[3/4] rounded-2xl border border-farm-border p-1 bg-white shadow-xl group">
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src="/images/about_interaction.png"
                    alt="Connecting travelers and rural farming communities"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Quote overlay card */}
                <div className="absolute -bottom-6 -right-6 md:-right-8 max-w-[260px] sm:max-w-xs md:max-w-sm bg-farm-cream border border-farm-border rounded-2xl p-5 sm:p-6 shadow-2xl animate-bounce-slow">
                  <div className="flex gap-3 items-start">
                    <span className="text-3xl sm:text-4xl text-farm-green font-serif leading-none select-none">“</span>
                    <p className="font-serif italic text-sm sm:text-base md:text-lg text-farm-text font-medium leading-relaxed">
                      {t.about.quote}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Description Content */}
          <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6 items-start text-left">
            <ScrollReveal animation="slide-left" duration={800}>
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-farm-gold uppercase bg-farm-beige border border-farm-border/60 py-1.5 px-3 rounded-full">
                {t.about.tag}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-farm-text leading-tight mt-3">
                {t.about.title}
              </h2>
              <div className="w-20 h-1 bg-farm-green rounded-full mt-2" />
              <p className="text-sm sm:text-base lg:text-lg text-farm-text-light leading-relaxed mt-4 font-light">
                {t.about.desc1}
              </p>
              <p className="text-sm sm:text-base text-farm-text-light leading-relaxed font-light mt-2">
                {t.about.desc2}
              </p>
              
              <button className="mt-4 group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-farm-green hover:text-farm-green-hover transition-colors">
                <span>{t.about.btn}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. Who Section */}
      <section id="who" className="py-20 sm:py-24 bg-farm-cream border-b border-farm-border/40 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <ScrollReveal animation="slide-up" duration={800} className="w-full flex flex-col items-center">
            <div className="text-center max-w-2xl flex flex-col items-center gap-3 mb-12 sm:mb-16">
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-farm-text">
                {t.who.title}
              </h2>
              <div className="w-16 h-1 bg-farm-green rounded-full mt-1" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl">
            {t.who.cards.map((card, idx) => (
              <ScrollReveal
                key={idx}
                animation="slide-up"
                delay={idx * 150}
                duration={800}
                className="h-full"
              >
                <div
                  className="bg-white border border-farm-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5 sm:gap-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group h-full"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-farm-beige border border-farm-border/60 flex items-center justify-center text-farm-green group-hover:bg-farm-green group-hover:text-white transition-colors duration-300">
                    {whoIcons[idx]}
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-farm-text">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-farm-text-light leading-relaxed font-light">
                    {card.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="py-20 sm:py-24 bg-farm-cream border-b border-farm-border/40 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <ScrollReveal animation="slide-up" duration={800} className="w-full flex flex-col items-center">
            <div className="text-center max-w-2xl flex flex-col items-center gap-3 mb-12 sm:mb-16">
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-farm-gold uppercase bg-farm-beige border border-farm-border/60 py-1.5 px-3 rounded-full">
                {t.features.tag}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-farm-text mt-3">
                {t.features.title}
              </h2>
              <div className="w-16 h-1 bg-farm-green rounded-full mt-2" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl">
            {t.features.cards.map((feat, idx) => (
              <ScrollReveal
                key={idx}
                animation="slide-up"
                delay={idx * 100}
                duration={800}
                className="h-full"
              >
                <div
                  className="bg-white border border-farm-border rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-farm-green flex flex-col gap-3.5 relative overflow-hidden group h-full"
                >
                  {/* Top indicator bar */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-farm-green/10 group-hover:bg-farm-green transition-colors duration-300" />

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] sm:text-xs font-bold text-farm-gold bg-farm-beige border border-farm-border/40 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-farm-text transition-colors group-hover:text-farm-green duration-200">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-farm-text-light leading-relaxed font-light">
                    {feat.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer className="bg-farm-green-dark text-emerald-50 py-16 px-6 font-light">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-emerald-900/30 pb-12">
          {/* Col 1 */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <span className="font-serif text-2xl font-bold tracking-tight text-white">
              {t.common.brandFull}
            </span>
            <p className="text-xs sm:text-sm text-emerald-200/70 max-w-sm leading-relaxed mt-2">
              {t.footer.desc}
            </p>
          </div>

          {/* Col 2 */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs sm:text-sm font-semibold text-farm-gold uppercase tracking-wider">
              {t.footer.linksTitle}
            </h4>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm text-emerald-200/80">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <h4 className="text-xs sm:text-sm font-semibold text-farm-gold uppercase tracking-wider">
              {t.footer.newsletterTitle}
            </h4>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center w-full mt-1.5"
            >
              <input
                type="email"
                placeholder={t.footer.emailPlaceholder}
                className="w-full h-10 bg-emerald-950/60 border border-emerald-800 rounded-l-lg px-4 text-xs sm:text-sm text-white placeholder-emerald-400 focus:outline-none focus:border-farm-gold transition-colors"
                required
              />
              <button
                type="submit"
                className="h-10 bg-farm-gold text-farm-green-dark font-semibold px-4 sm:px-5 rounded-r-lg hover:bg-farm-gold-hover transition-all text-xs sm:text-sm flex items-center justify-center shrink-0 active:scale-[0.98]"
              >
                {t.footer.newsletterBtn}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-emerald-300/50">
          <p>{t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
              </svg>
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8.001 16c2.172 0 2.444-.01 3.298-.048.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
