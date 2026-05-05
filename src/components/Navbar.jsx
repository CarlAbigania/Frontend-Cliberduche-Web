import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaTimes, FaBars, FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import gsap from "gsap";
import logo from "/logo/cliberduche_logo.png";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ introDone = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTop, setIsTop] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [displayDragY, setDisplayDragY] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const desktopNavRef = useRef(null);
  const burgerRef = useRef(null);
  const animationRan = useRef(false);
  const navBarRef = useRef(null);
  const mobileChainRef = useRef(null);

  const chainLength = isDarkMode ? 72 : 48;
  const chainPulled = isDarkMode;

  const dragY = useMotionValue(0);
  const chainHeight = useTransform(dragY, (v) => chainLength + v);
  const bulbShadow = useTransform(
    dragY,
    (v) => `0px ${6 + v * 0.3}px ${14 + v * 0.3}px rgba(0,0,0,0.28)`
  );
  const innerBarScaleX = useTransform(dragY, (v) => 1 + v * 0.02);
  const bulbRotate = useTransform(dragY, (v) => (v > 0 ? Math.min(8, v * 0.08) : 0));

  useEffect(() => {
    let raf = null;
    const handler = (v) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setDisplayDragY(Math.max(0, Math.round(v)));
        raf = null;
      });
    };
    const unsubscribe = dragY.on("change", handler);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      unsubscribe();
    };
  }, [dragY]);

  useEffect(() => {
    const handleScrollAndResize = () => {
      const currentScrollPos = window.scrollY;
      setIsScrolled(currentScrollPos > 50);
      setIsTop(currentScrollPos < 10);

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const bottomThreshold = 50;
      const atBottom = scrollY + windowHeight >= documentHeight - bottomThreshold;
      setIsAtBottom(atBottom);
    };
    window.addEventListener("scroll", handleScrollAndResize);
    window.addEventListener("resize", handleScrollAndResize);
    handleScrollAndResize();
    return () => {
      window.removeEventListener("scroll", handleScrollAndResize);
      window.removeEventListener("resize", handleScrollAndResize);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (introDone) {
      setTimeout(() => setIsLoaded(true), 300);
    }
  }, [introDone]);

  useEffect(() => {
    if (isLoaded && !animationRan.current) {
      const navLinks = desktopNavRef.current?.children;

      gsap.set(desktopNavRef.current, { opacity: 0, y: -20 });
      gsap.set(navLinks, { opacity: 0, y: 20 });

      gsap.to(desktopNavRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(navLinks, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
          });

          if (burgerRef.current) {
            gsap.to(burgerRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
            });
          }
        },
      });

      animationRan.current = true;
    }

    return () => {
      gsap.killTweensOf(desktopNavRef.current?.children);
      gsap.killTweensOf(desktopNavRef.current);
      if (burgerRef.current) gsap.killTweensOf(burgerRef.current);
    };
  }, [isLoaded]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const finalDragY = Math.max(0, info.offset.y);
    if (finalDragY > 8) {
      toggleTheme();
    }
    animate(dragY, 0, { type: "spring", stiffness: 420, damping: 36, mass: 0.6 });
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/projects", label: "Projects" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;
  const desktopLinkClass = (path) =>
    isActive(path)
      ? "text-green-600 dark:text-green-400"
      : "text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400";

  const hideLogo = (isMobile && isOpen) || !isTop;

  const ChainComponent = ({ isMobile = false }) => (
    <div
      className={`flex flex-col items-center ${isMobile
        ? "absolute top-full left-1/2 transform -translate-x-1/2"
        : "absolute lg:right-6 lg:left-auto lg:transform-none left-1/2 transform -translate-x-1/2 top-full"
        } z-10`}
      ref={isMobile ? mobileChainRef : navBarRef}
    >
      <motion.div
        className="w-1 bg-gradient-to-b from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-300 rounded-full shadow-sm relative"
        style={{
          height: chainHeight,
          transformOrigin: "top center",
        }}
        transition={{
          type: "spring",
          stiffness: isDragging ? 420 : 220,
          damping: isDragging ? 40 : 28,
          mass: 0.6,
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-evenly pointer-events-none">
          {Array.from({ length: Math.max(0, Math.floor((chainLength + 80) / 4)) }).map((_, i) => (
            <div
              key={i}
              className="w-full h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"
              style={{
                opacity: displayDragY > 4 ? 0.4 : 0.06,
                transition: "opacity 160ms linear",
              }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 80 }}
        dragElastic={0.18}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={(e, info) => {
          const v = Math.max(0, info.offset.y);
          dragY.set(v);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ cursor: "grabbing" }}
        className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-300 dark:to-green-500 rounded-full shadow-lg border-2 border-green-500 dark:border-green-400 transition-shadow duration-200 relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          top: -20,
          boxShadow: bulbShadow,
          rotate: bulbRotate,
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-green-300 to-transparent opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col space-y-0.5">
            <motion.div
              className="w-3 h-0.5 bg-green-700 dark:bg-green-200 rounded-full opacity-60"
              style={{ scaleX: innerBarScaleX }}
            />
            <motion.div
              className="w-3 h-0.5 bg-green-700 dark:bg-green-200 rounded-full opacity-60"
              style={{ scaleX: innerBarScaleX }}
            />
            <motion.div
              className="w-3 h-0.5 bg-green-700 dark:bg-green-200 rounded-full opacity-60"
              style={{ scaleX: innerBarScaleX }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isDarkMode ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="absolute inset-0 flex items-center justify-center bg-green-500/90 dark:bg-green-400/90 rounded-full backdrop-blur-sm"
              style={{ rotate: chainPulled ? -180 : 0 }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white"
                aria-hidden
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="absolute inset-0 flex items-center justify-center bg-green-500/90 dark:bg-green-400/90 rounded-full backdrop-blur-sm"
              style={{ rotate: chainPulled ? -180 : 0 }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-800 dark:text-gray-200"
                aria-hidden
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {!isDragging && !chainPulled && (
          <motion.div
            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap pointer-events-none bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: [0, 1, 1, 0], y: [0, -2, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
          >
            Pull to toggle theme!
          </motion.div>
        )}

        {isDragging && displayDragY > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: displayDragY > 8 ? 1 : 0.9, scale: displayDragY > 8 ? 1.06 : 1 }}
            className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-white px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none font-medium transition-all duration-150 ${displayDragY > 8 ? "bg-green-600" : "bg-green-500"
              }`}
          >
            {displayDragY > 8
              ? `🌟 Release to switch to ${isDarkMode ? "Light" : "Dark"} Mode!`
              : `Pull ${Math.max(0, 8 - displayDragY)}px more`}
          </motion.div>
        )}

        {!isDragging && displayDragY > 0 && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-300 opacity-30"
            initial={{ scale: 1.1, opacity: 0.45 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        )}
      </motion.div>
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-opacity duration-500 transition-transform duration-300 ease-in-out ${isLoaded ? "opacity-100" : "opacity-0"
          }`}
        style={{ transform: isAtBottom ? "translateY(-100%)" : "translateY(0)" }}
      >
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 lg:px-8 h-20 transition-all duration-300 bg-transparent text-gray-900 dark:text-white mt-4">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-3 group transition-opacity duration-300 ${hideLogo ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            aria-label="Go to homepage"
            disabled={hideLogo}
          >
            <img
              id="nav-logo"
              src={logo}
              alt="Cliberduche Logo"
              className="h-10 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </button>

          {/* Right side container: burger + desktop nav (with chain inside) */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Mobile Menu Button with Chain (visible only on <1024px) */}
            <div className="lg:hidden relative">
              <button
                ref={burgerRef}
                onClick={() => setIsOpen(true)}
                className="relative z-50 w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-sm transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                style={{ opacity: 0, transform: "translateY(20px)" }}
                aria-label="Open menu"
                aria-expanded={isOpen}
              >
                <FaBars className="w-5 h-5" />
              </button>
              {/* Mobile Chain */}
              <ChainComponent isMobile={true} />
            </div>

            {/* Desktop Navigation (hidden on mobile) */}
            <nav
              ref={desktopNavRef}
              className="hidden lg:flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 px-6 py-2 rounded-sm shadow-2xl relative"
            >
              {/* All nav items (Home, About, Projects, Contact) are now plain links */}
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 font-medium transition-all duration-300 group flex items-center gap-1 ${desktopLinkClass(item.path)}`}
                  style={{ opacity: 0, transform: "translateY(20px)" }}
                >
                  <span className="relative z-10 text-sm tracking-[0.3em] uppercase">
                    {item.label}
                  </span>
                  <FaArrowUp
                    className={`w-3 h-3 rotate-45 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${isActive(item.path)
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400"
                      }`}
                  />
                </Link>
              ))}

              {/* Login button – now the CTA */}
              <Link
                to="/login"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 group ml-2"
                style={{ opacity: 0, transform: "translateY(20px)" }}
              >
                <span>Login</span>
                <FaArrowUp className="w-3 h-3 rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              {/* Desktop Chain */}
              <ChainComponent isMobile={false} />
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-500 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsOpen(false)}
      >
        <div className="absolute inset-0 bg-transparent" />

        <div
          className={`absolute right-0 top-0 h-full w-full sm:w-[400px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-l border-gray-200 dark:border-gray-700 shadow-2xl transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                navigate("/");
                setIsOpen(false);
              }}
              className="flex items-center gap-3"
            >
              <img src={logo} alt="Cliberduche Logo" className="h-10 w-auto" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300"
              aria-label="Close menu"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 flex flex-col justify-start px-6 py-8 space-y-2">
            {/* All nav items (Home, About, Projects, Contact) – now all plain */}
            {navItems.map((item, index) => {
              const activeClass = isActive(item.path)
                ? "text-green-600 dark:text-green-400"
                : "text-gray-800 dark:text-gray-200";

              return (
                <div
                  key={item.path}
                  className={`transition-all duration-500 ease-out ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                  style={{
                    transitionDelay: isOpen ? `${index * 100 + 200}ms` : "0ms",
                  }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center justify-between w-full px-6 py-3 rounded-sm transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 ${activeClass}`}
                  >
                    <span className="text-sm tracking-[0.3em] uppercase">{item.label}</span>
                    <FaArrowUp
                      className={`w-4 h-4 rotate-45 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${isActive(item.path)
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400"
                        }`}
                    />
                  </Link>
                </div>
              );
            })}

            {/* Login button – now the CTA on mobile */}
            <div
              className={`transition-all duration-500 ease-out ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              style={{
                transitionDelay: isOpen ? `${navItems.length * 100 + 200}ms` : "0ms",
              }}
            >
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center justify-between w-full group"
              >
                <span className="text-sm tracking-[0.3em] uppercase">Login</span>
                <FaArrowUp className="w-4 h-4 rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </nav>

          {/* Footer (only copyright) */}
          <div
            className={`px-6 py-6 border-t border-gray-200 dark:border-gray-700 transition-all duration-500 delay-700 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm">© 2026 Cliberduche. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}