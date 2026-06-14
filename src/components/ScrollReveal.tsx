import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-in" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-in";
  delay?: number; // in ms
  duration?: number; // in ms
  threshold?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  animation = "slide-up",
  delay = 0,
  duration = 750,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  const getAnimationClasses = () => {
    switch (animation) {
      case "fade-in":
        return isVisible ? "opacity-100" : "opacity-0";
      case "slide-up":
        return isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10";
      case "slide-down":
        return isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10";
      case "slide-left":
        return isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10";
      case "slide-right":
        return isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10";
      case "zoom-in":
        return isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95";
      default:
        return isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10";
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${getAnimationClasses()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
