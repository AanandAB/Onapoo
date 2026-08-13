"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "@/lib/i18n";
import { whatsappLink } from "@/lib/site";
import { useTilt } from "@/components/motion";
import { Pookalam } from "@/components/pookalam";
import { Countdown } from "@/components/countdown";
import { Nilavilakku, FlowerGlyph } from "@/components/onam-decor";

gsap.registerPlugin(ScrollTrigger);

const PETALS = [
  { left: "6%", size: 14, color: "#b83a2b", dur: 16, delay: 0, drift: "6vw", rot: 300, opacity: 0.35 },
  { left: "18%", size: 10, color: "#e8822a", dur: 20, delay: 3, drift: "-4vw", rot: 260, opacity: 0.3 },
  { left: "32%", size: 12, color: "#c79a3b", dur: 18, delay: 6, drift: "5vw", rot: 340, opacity: 0.3 },
  { left: "48%", size: 9, color: "#7a3b69", dur: 22, delay: 2, drift: "-5vw", rot: 280, opacity: 0.28 },
  { left: "63%", size: 13, color: "#b83a2b", dur: 17, delay: 5, drift: "4vw", rot: 320, opacity: 0.32 },
  { left: "78%", size: 10, color: "#1f5c34", dur: 21, delay: 1, drift: "-3vw", rot: 300, opacity: 0.25 },
  { left: "90%", size: 12, color: "#e8822a", dur: 19, delay: 4, drift: "6vw", rot: 280, opacity: 0.3 },
];

export function Hero() {
  const { lang, t } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const { ref: tiltRef, onMouseMove: tiltMove, onMouseLeave: tiltLeave } = useTilt<HTMLDivElement>(6);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Petals assemble on load
      gsap.from(".petal-node", {
        opacity: 0,
        scale: 0.2,
        duration: 0.9,
        stagger: 0.015,
        ease: "back.out(1.6)",
        delay: 0.2,
      });
      gsap.from(".hero-pookalam", { scale: 0.72, opacity: 0, duration: 1.1, ease: "power3.out" });
      gsap.from(".hero-copy > *", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.15,
      });

      // Parallax: pookalam drifts slower than the copy as you scroll
      gsap.to(".hero-pookalam", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      gsap.to(".hero-pookalam", {
        rotateX: 16,
        rotateY: -8,
        scale: 1.05,
        transformPerspective: 1100,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      gsap.to(".hero-copy", {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 md:pt-16"
    >
      {/* Background washes */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-chethi/10 blur-3xl" />

      {/* Onam motifs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Nilavilakku className="absolute -bottom-8 -left-6 h-40 w-auto text-gold/10" />
        <FlowerGlyph className="absolute right-[10%] top-10 h-14 w-14 text-gold/10" />
        <FlowerGlyph className="absolute left-[16%] top-28 h-8 w-8 text-chethi/10" />
        <FlowerGlyph className="absolute right-[24%] bottom-10 h-6 w-6 text-marigold/15" />
      </div>

      {/* Ambient falling petals */}
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size * 1.15,
              background: p.color,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              "--petal-drift": p.drift,
              "--petal-rotate": `${p.rot}deg`,
              "--petal-opacity": p.opacity,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
        {/* Copy */}
        <div className="hero-copy order-2 md:order-1">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-paper px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gold-deep">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-marigold" />
            {t("hero_kicker")}
          </p>

          <h1 className="font-display text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-7xl">
            {lang === "ml" ? (
              <>
                നിങ്ങളുടെ <span className="gold-gradient-text">പൂക്കളം</span>
                <br />
                ഇതളോരോന്നായി
              </>
            ) : (
              <>
                Grow your <span className="gold-gradient-text">pookalam</span>
                <br />
                petal by petal
              </>
            )}
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            {t("hero_sub")}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#shop"
              className="rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5"
            >
              {t("hero_cta")}
            </a>
            <a
              href={whatsappLink(lang === "ml" ? "ഹലോ, ഓണപ്പൂക്കൾ ഓർഡർ ചെയ്യണം" : "Hi, I'd like to order Onam flowers")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-leaf/30 bg-paper px-6 py-3 text-sm font-semibold text-leaf transition-transform hover:-translate-y-0.5"
            >
              WhatsApp
            </a>
          </div>

          <Countdown />
        </div>

        {/* Pookalam */}
        <div className="hero-pookalam order-1 mx-auto w-full max-w-sm md:order-2 md:max-w-none">
          <div
            ref={tiltRef}
            onMouseMove={tiltMove}
            onMouseLeave={tiltLeave}
            className="will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="spin-slow">
              <div className="breathe">
                <Pookalam className="h-full w-full drop-shadow-[0_30px_60px_rgba(42,33,20,0.18)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
