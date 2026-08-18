"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Lenis smooth scroll + GSAP ScrollTrigger wiring (with smooth anchor scrolling). */
export function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (reducedMotion()) return;
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      // Smooth-scroll #anchor links, offset for the 64px sticky header.
      anchors: { offset: -72 },
    });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

type RevealVariant = "up" | "left" | "right" | "zoom";

/** IntersectionObserver-based scroll reveal with a direction variant. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Hide only via JS (progressive enhancement): if hydration/JS ever fails,
    // the content stays visible instead of leaving the page blank.
    el.classList.add("reveal-hidden");
    let io: IntersectionObserver | null = null;
    let fallback: ReturnType<typeof setTimeout> | null = null;
    const reveal = () => {
      if (!el.classList.contains("reveal-hidden")) return;
      el.classList.remove("reveal-hidden");
      el.classList.add("revealed");
      io?.disconnect();
      if (fallback) clearTimeout(fallback);
    };
    io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) reveal();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    // Safety net: never leave content hidden if the observer fails to fire.
    fallback = setTimeout(reveal, 2500);
    return () => {
      io?.disconnect();
      if (fallback) clearTimeout(fallback);
    };
  }, []);

  const variantCls =
    variant === "left" ? "reveal-left" : variant === "right" ? "reveal-right" : variant === "zoom" ? "reveal-zoom" : "";

  return (
    <div ref={ref} className={`reveal ${variantCls} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Thin gold scroll-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = barRef.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[3px]">
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-gold via-marigold to-chethi"
        style={{ transition: "transform 0.12s linear" }}
      />
    </div>
  );
}

/**
 * Mouse-tracking 3D tilt hook. Attach the returned ref + handlers to an element
 * to give it a subtle perspective tilt that follows the cursor.
 */
export function useTilt<T extends HTMLElement = HTMLElement>(max = 7) {
  const ref = useRef<T | null>(null);

  const onMouseMove = (e: { clientX: number; clientY: number }) => {
    if (reducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform 0.08s ease-out";
    el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-6px) scale3d(1.02,1.02,1.02)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "";
  };

  return { ref, onMouseMove, onMouseLeave };
}
