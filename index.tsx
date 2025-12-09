import React, { useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const App = () => {
  // Use a ref for the outer "Ghost" container which provides the scroll length
  const ghostContainerRef = useRef<HTMLDivElement>(null);
  const orbitalRef = useRef<HTMLElement>(null); // Target the whole orbital ring
  const desc1Ref = useRef<HTMLDivElement>(null);
  const desc2Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Initial Setup
      // Set initial state for second text: invisible and slightly pushed down
      gsap.set(desc2Ref.current, { autoAlpha: 0, y: 20 });

      // 2. Entrance Animation (Intro)
      // Plays immediately on load/refresh
      const introTl = gsap.timeline({
        defaults: { ease: "power3.out" }
      });

      introTl
        // Status bar fades in first
        .from(".status-bar", { 
          y: -20, 
          autoAlpha: 0, 
          duration: 1 
        })
        // Orbital grows from center (simulating a planet/sun rising)
        .from(orbitalRef.current, { 
          scale: 0.6, 
          autoAlpha: 0, 
          duration: 1.8,
          ease: "back.out(1.0)" 
        }, 0)
        // Headlines slide up with a stagger
        .from(".headlines > *", { 
          y: 40, 
          autoAlpha: 0, 
          stagger: 0.15, 
          duration: 1.2,
          ease: "power4.out"
        }, 0.2)
        // Timeline info slides in from left
        .from(".timeline > *", { 
          x: -20, 
          autoAlpha: 0, 
          stagger: 0.1, 
          duration: 1 
        }, 0.6)
        // Description text fades up last
        .from(desc1Ref.current, { 
          y: 20, 
          autoAlpha: 0, 
          duration: 1 
        }, 0.8);

      // 3. Scroll Interaction Timeline
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: ghostContainerRef.current,
          start: "top top", 
          end: "bottom bottom",
          scrub: 0.5, // smooth scrubbing
        }
      });

      // --- Scroll Animation Steps ---

      // A) Rotate Orbital (Gradient + Flare)
      scrollTl.to(orbitalRef.current, {
        rotation: 120, 
        ease: "none",
        duration: 1
      }, 0);

      // B) Text Switch
      // Step 1: Fade out first text
      scrollTl.to(desc1Ref.current, {
        autoAlpha: 0,
        y: -30, // Move up as it fades
        ease: "power2.in",
        duration: 0.35
      }, 0);

      // Step 2: Fade in second text
      scrollTl.to(desc2Ref.current, {
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.55
      }, 0.45);

      // C) Text Highlight Color
      scrollTl.to(".highlight", {
        backgroundPosition: "0% 100%",
        ease: "none",
        duration: 0.6 
      }, 0.4);

    }, ghostContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    // 1. Outer "Ghost" container to create scrollable height (300vh)
    <div ref={ghostContainerRef} style={{ height: '300vh', width: '100%' }}>
      
      {/* 2. Fixed Wrapper to center the UI visually at all times */}
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        width: '100%', 
        height: '100%',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        pointerEvents: 'none' // Let clicks pass through if needed
      }}>
        
        {/* 3. The actual content card (Enable pointer events back for interactivity) */}
        <main className="screen" style={{ pointerEvents: 'auto' }}>
          <header className="status-bar">
            <span className="status-time">9:41</span>
            <div className="status-icons" aria-hidden="true">
              <span className="status-signal"></span>
              <span className="status-wifi"></span>
              <span className="status-battery"></span>
            </div>
          </header>

          <section className="headlines">
            <h1>
              不要<span className="highlight">温柔地</span>走进那<br />个<span className="highlight">良夜</span>。
            </h1>
            <p className="subheading">
              Do not <span className="highlight">go gentle</span> into the good night
            </p>
            <p className="movie-meta">2012 《星际穿越》</p>
          </section>

          <section className="timeline">
            <p className="accent">彼时彼刻/</p>
            <p className="datetime">1951年 · 22:40 · 良夜</p>
            <p className="publication">发表于意大利文学期刊《Botteghe Oscure》第二期</p>
          </section>

          {/* Added ref to the orbital section to rotate the whole thing */}
          <section className="orbital" aria-hidden="true" ref={orbitalRef}>
            <span className="flare"></span>
          </section>

          <div className="description">
            {/* Initial Text */}
            <div className="description-group" ref={desc1Ref} style={{ position: 'relative' }}>
              <p>
                这句话出自英国诗人狄兰·托马斯写给其父亲的诗，但在电影里，它被赋予了全新的、宏大的意义。
              </p>
              <p>地球环境恶化，人类面临灭绝。这“良夜”，就是全人类的末日。</p>
            </div>

            {/* Target Text (Hidden initially) */}
            <div className="description-group" ref={desc2Ref} style={{ position: 'absolute', top: 0, left: 0 }}>
              <p>
                不要放弃，不要顺从，要用愤怒和生命力去抗争。
              </p>
              <p>
                人类在绝境中，为了生存和延续，能迸发出的最原始、最悲壮的勇气。
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);