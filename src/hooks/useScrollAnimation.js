// useScrollAnimation.js
import { useEffect, useRef, useState } from 'react';

export default function useScrollAnimation(threshold = 0.1, enabled = true, delay = 100) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);
    const observerRef = useRef(null);

    useEffect(() => {
        if (!enabled) {
            setIsVisible(false);
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
            return;
        }

        const node = ref.current;
        if (!node) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Smooth trigger using requestAnimationFrame with optional delay
                    const handle = requestAnimationFrame(() => {
                        setTimeout(() => setIsVisible(true), delay);
                    });

                    return () => cancelAnimationFrame(handle);
                }
            },
            { threshold }
        );

        observerRef.current.observe(node);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, [threshold, enabled, delay]);

    const className = `
        transition-opacity transition-transform transition-filter
        duration-1000 ease-out
        ${isVisible
            ? 'opacity-100 translate-y-0 scale-100 blur-0'
            : 'opacity-0 translate-y-6 scale-95 blur-sm'
        }
    `;

    return [ref, className, isVisible];
}
