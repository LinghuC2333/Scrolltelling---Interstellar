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
      // 1. Initial State
      // Set initial state for second text: invisible and slightly pushed down
      gsap.set(desc2Ref.current, { autoAlpha: 0, y: 20 });
      
      // Note: We no longer manipulate the flare directly. 
      // We will rotate the entire .orbital container. 
      // This automatically rotates the gradient border AND moves the flare along the path.

      // 2. Timeline attached to the "Ghost" container
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ghostContainerRef.current,
          start: "top top", 
          end: "bottom bottom",
          scrub: 0.5, // smooth scrubbing
        }
      });

      // --- Animation Steps ---

      // A) Rotate Orbital (Gradient + Flare)
      // Rotating the parent moves the child (flare) along the arc and rotates the conic gradient.
      // 120 degrees moves it from ~2 o'clock to ~6 o'clock positions roughly matching the design.
      tl.to(orbitalRef.current, {
        rotation: 120, 
        ease: "none",
        duration: 1
      }, 0);

      // B) Text Switch
      // Clean sequence: 
      // 0.0 -> 0.35: Text 1 Fades Out
      // 0.35 -> 0.45: Tiny Gap/Transition
      // 0.45 -> 1.0: Text 2 Fades In
      
      // Step 1: Fade out first text
      tl.to(desc1Ref.current, {
        autoAlpha: 0,
        y: -30, // Move up as it fades
        ease: "power2.in",
        duration: 0.35
      }, 0);

      // Step 2: Fade in second text
      // Start slightly after the first one ends to avoid messy overlap
      tl.to(desc2Ref.current, {
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.55
      }, 0.45);

      // C) Text Highlight Color
      // Animate the background position of the .highlight spans.
      // 0% 0% is top (white), 0% 100% is bottom (accent).
      // This creates a "filling up" effect from bottom to top.
      // We start this animation roughly when the second text starts appearing.
      tl.to(".highlight", {
        backgroundPosition: "0% 100%",
        ease: "none",
        duration: 0.6 // Takes the latter 60% of the scroll to fill up completely
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
