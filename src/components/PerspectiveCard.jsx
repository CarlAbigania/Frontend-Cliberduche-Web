// src/homepage/PerspectiveCard.jsx
import React, { useRef, useEffect } from "react";

function PerspectiveCard({
  children,
  className = "",
  enableTilt = true,
  maxRotate = 12,
  defaultRotateX = 0,
  defaultRotateY = 0,
  defaultTranslateZ = 0,
  defaultScale = 1, // desired interactive scale (e.g. 1.03)
}) {
  const innerRef = useRef(null);
  const wrapperRef = useRef(null);

  // base transform for inner (NO scale at rest)
  const baseTransform = `rotateX(${defaultRotateX}deg) rotateY(${defaultRotateY}deg) translateZ(${defaultTranslateZ}px)`;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!inner || !wrapper) return;

    // initialize (no scale at rest)
    inner.style.transform = baseTransform;
    inner.style.transformStyle = "preserve-3d";
    inner.style.willChange = "transform";
    inner.style.transition = "transform 350ms cubic-bezier(.2,.9,.2,1)";

    if (!enableTilt) return;

    let rafId = null;

    // helper to set transform (with optional scale)
    function setInnerTransform({ rotateX, rotateY, scale = 1 }) {
      const t = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${defaultTranslateZ}px) scale(${scale})`;
      inner.style.transform = t;
    }

    // mouseenter / touchstart: apply interactive scale immediately (even before move)
    function onEnter() {
      // keep rotation at base until pointer moves; add scale for pop
      inner.style.transition = "transform 220ms cubic-bezier(.2,.9,.2,1)";
      setInnerTransform({
        rotateX: defaultRotateX,
        rotateY: defaultRotateY,
        scale: defaultScale,
      });
    }

    function onMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = wrapper.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;

      const deltaY = (px - 0.5) * 2 * maxRotate;
      const deltaX = (0.5 - py) * 2 * maxRotate;

      const combinedRotateX = defaultRotateX + deltaX;
      const combinedRotateY = defaultRotateY + deltaY;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // while interacting, include the interactive scale so the card pops while tilted
        setInnerTransform({
          rotateX: combinedRotateX,
          rotateY: combinedRotateY,
          scale: defaultScale,
        });
      });
    }

    // on leave: remove scale and return to base rotation
    function onLeave() {
      if (rafId) cancelAnimationFrame(rafId);
      inner.style.transition = "transform 500ms cubic-bezier(.2,.9,.2,1)";
      // restore to base transform with scale 1
      setInnerTransform({ rotateX: defaultRotateX, rotateY: defaultRotateY, scale: 1 });
      // clear the transition after it finishes so JS-driven moves feel consistent later
      setTimeout(() => {
        if (inner) inner.style.transition = "transform 350ms cubic-bezier(.2,.9,.2,1)";
      }, 500);
    }

    // pointer handlers
    wrapper.addEventListener("mouseenter", onEnter);
    wrapper.addEventListener("mousemove", onMove);
    wrapper.addEventListener("mouseleave", onLeave);

    // touch handlers
    wrapper.addEventListener("touchstart", onEnter, { passive: true });
    wrapper.addEventListener("touchmove", onMove, { passive: true });
    wrapper.addEventListener("touchend", onLeave);

    return () => {
      wrapper.removeEventListener("mouseenter", onEnter);
      wrapper.removeEventListener("mousemove", onMove);
      wrapper.removeEventListener("mouseleave", onLeave);

      wrapper.removeEventListener("touchstart", onEnter);
      wrapper.removeEventListener("touchmove", onMove);
      wrapper.removeEventListener("touchend", onLeave);

      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    enableTilt,
    maxRotate,
    defaultRotateX,
    defaultRotateY,
    defaultTranslateZ,
    defaultScale,
    baseTransform,
  ]);

  const initialStyle = {
    transform: baseTransform, // no scale at rest
    transition: "transform 350ms cubic-bezier(.2,.9,.2,1)",
  };

  return (
    <div ref={wrapperRef} className={`perspective ${className}`} aria-hidden={false}>
      <div ref={innerRef} className="card-inner transform-gpu will-change-transform" style={initialStyle}>
        {children}
      </div>
    </div>
  );
}

export default PerspectiveCard;
