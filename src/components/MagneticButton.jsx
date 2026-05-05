import { useState, useEffect, useRef, useCallback } from 'react';

const MagneticButton = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.5s ease-in-out',
  disableOnTouch = false,
  wrapperClassName = '',
  innerClassName = '',
  ...props
}) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const wrapperRef = useRef(null);
  const frameRef = useRef(null);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const shouldDisable = disabled || (disableOnTouch && isTouchDevice);

  const updatePosition = useCallback((clientX, clientY) => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let offsetX = (clientX - centerX) / magnetStrength;
    let offsetY = (clientY - centerY) / magnetStrength;

    // Clamp movement using padding
    const maxX = rect.width / 2 + padding;
    const maxY = rect.height / 2 + padding;

    offsetX = Math.max(-maxX, Math.min(maxX, offsetX));
    offsetY = Math.max(-maxY, Math.min(maxY, offsetY));

    setPosition({ x: offsetX, y: offsetY });
  }, [magnetStrength, padding]);

  const handlePointerMove = useCallback((e) => {
    if (shouldDisable) return;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      updatePosition(e.clientX, e.clientY);
    });
  }, [updatePosition, shouldDisable]);

  useEffect(() => {
    if (shouldDisable || !isActive) {
      setPosition({ x: 0, y: 0 });
      return;
    }

    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isActive, shouldDisable, handlePointerMove]);

  const transitionStyle = isActive
    ? activeTransition
    : inactiveTransition;

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      style={{
        position: 'relative',
        display: 'inline-block',
        touchAction: 'none', // important for mobile
      }}
      onPointerEnter={() => !shouldDisable && setIsActive(true)}
      onPointerLeave={() => setIsActive(false)}
      onPointerDown={() => !shouldDisable && setIsActive(true)}
      onPointerUp={() => setIsActive(false)}
      {...props}
    >
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: transitionStyle,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MagneticButton;