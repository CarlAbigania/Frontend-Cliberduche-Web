import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function BackToTopButton({ className = "fixed bottom-6 right-6" }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const pageHeight = document.documentElement.scrollHeight;

            // Show button when user is within 200px of bottom
            const nearBottom = pageHeight - scrollPosition < 200;

            setVisible(nearBottom);
        };

        window.addEventListener("scroll", toggleVisibility);
        toggleVisibility(); // Initial check

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        const isTouchDevice =
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0;

        if (isTouchDevice) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } else {
            // --- CHANGE HERE: dispatch an object with smooth: true ---
            window.dispatchEvent(
                new CustomEvent("smooth-scroll-set-target", {
                    detail: { value: 0, smooth: true }
                })
            );
        }
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className={`z-40 p-0 rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 transform flex items-center justify-center w-14 h-14
                ${visible ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"}
                hover:bg-green-600 hover:scale-110 active:scale-95
                ${className}`}
        >
            <FaArrowUp className="text-lg" />
        </button>
    );
}