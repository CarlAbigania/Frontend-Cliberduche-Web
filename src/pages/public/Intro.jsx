import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import logo from "/logo/cliberduche_logo.png";

export default function Intro({ title, onFinish }) {
  const container = useRef(null);
  const titleRef = useRef(null);
  const progress = useRef(null);
  const counter = useRef(null);
  const logoRef = useRef(null);
  const logoWrapperRef = useRef(null);

  useEffect(() => {
    // Split text into letters — h1 is opacity:0 so no flash, but layout space is preserved
    const letters = titleRef.current.innerText.split("");
    titleRef.current.innerHTML = letters
      .map((letter) => `<span class="letter">${letter}</span>`)
      .join("");

    // Make h1 visible — letters are opacity:0 so still hidden, GSAP animates them in
    gsap.set(titleRef.current, { opacity: 1 });
    gsap.set(titleRef.current.querySelectorAll(".letter"), { opacity: 0, y: 80 });

    gsap.set(logoWrapperRef.current, { visibility: "visible", clipPath: "inset(0 0 100% 0)" });
    gsap.set(logoRef.current, { opacity: 0, scale: 0.8, rotateY: -45 });
    gsap.set(progress.current, { width: 0, visibility: "visible" });

    // Loading counter
    let obj = { val: 0 };
    gsap.to(obj, {
      val: 100,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        counter.current.innerText = Math.floor(obj.val);
      },
    });

    const tl = gsap.timeline({
      delay: 0.5,
      onComplete: () => setTimeout(onFinish, 200),
    });

    // Logo mask reveal + 3D rotation
    tl.to(logoWrapperRef.current, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.2,
      ease: "power3.inOut",
    }).to(
      logoRef.current,
      {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)",
      },
      "<"
    );

    // Start subtle floating animation for logo while letters load
    gsap.to(logoRef.current, {
      y: "-=8",
      rotateY: "+=2",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Letters animation
    tl.to(titleRef.current.querySelectorAll(".letter"), {
      y: 0,
      opacity: 1,
      stagger: 0.04,
      duration: 0.8,
      ease: "power3.out",
    });

    // Progress bar animation
    tl.to(
      progress.current,
      {
        width: "100%",
        duration: 2,
        ease: "power2.out",
      },
      "<"
    );

    // Exit intro
    tl.to(container.current, {
      clipPath: "inset(0 0 100% 0)",
      duration: 1.2,
      ease: "power4.inOut",
    });
  }, [onFinish]);

  return (
    <>
      <style>{`
        .letter { display: inline-block; }

        .intro-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;

          background-image:
            linear-gradient(to right, var(--grid-green) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-green) 1px, transparent 1px),
            linear-gradient(to right, var(--grid-blue) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-blue) 1px, transparent 1px);

          background-size:
            160px 160px,
            160px 160px,
            20px 20px,
            20px 20px;

          background-repeat: repeat;
          animation: gridMove 8s linear infinite;
        }

        @keyframes gridMove {
          from { background-position: 0 0, 0 0, 0 0, 0 0; }
          to { background-position: 0 160px, 160px 0, 0 20px, 20px 0; }
        }
      `}</style>

      <div
        ref={container}
        // 👇 Changed dark background from gray-900 to gray-800 for better transition visibility
        className="intro-container fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f4faf7] dark:bg-gray-800 perspective-1000"
      >
        <div className="intro-grid" />

        {/* visibility:hidden preserves layout space before GSAP runs */}
        <div
          ref={logoWrapperRef}
          className="overflow-hidden mb-6 relative z-10"
          style={{ visibility: "hidden" }}
        >
          <img
            ref={logoRef}
            src={logo}
            alt="Logo"
            className="w-24 md:w-32"
          />
        </div>

        {/* opacity:0 hides text before split, layout space preserved via line-height */}
        <h1
          ref={titleRef}
          className="text-3xl md:text-4xl font-semibold tracking-wide relative z-10 text-[#0b2545] dark:text-gray-100"
          style={{ opacity: 0 }}
        >
          {title}
        </h1>

        {/* Loading bar */}
        <div className="w-40 h-[2px] bg-gray-300 dark:bg-gray-600 mt-6 overflow-hidden relative z-10">
          {/* visibility:hidden preserves layout space, no full-width flash */}
          <div
            ref={progress}
            className="h-full bg-[#0b2545] dark:bg-gray-300"
            style={{ visibility: "hidden" }}
          />
        </div>

        {/* Loading counter */}
        <div
          ref={counter}
          className="mt-4 text-sm tracking-widest text-gray-500 dark:text-gray-400 relative z-10"
        >
          0
        </div>
      </div>
    </>
  );
}