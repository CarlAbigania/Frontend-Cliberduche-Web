import React, { useEffect, useState, useRef, forwardRef, useCallback } from "react";
import { LuInfinity } from "react-icons/lu";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import { useNavigate, Link } from "react-router-dom";
import office from "/office.jpg";
import { LetterReveal, BlockReveal } from "../../components/RevealAnimations";
import ScrollReveal from "../../components/ScrollReveal";
import MagneticButton from "../../components/MagneticButton";
import { FaInfinity, FaPhoneAlt, FaLeaf } from "react-icons/fa";

import silang_img_1 from "/projects/silangCavite_2021/2021_img_1.png";

// ---------- Testimonials Data ----------
const testimonials = [
    {
        id: 1,
        name: "John Doe",
        role: "Project Manager, ABC Construction",
        quote:
            "Cliberduche delivered top‑quality backfill materials ahead of schedule. Their team’s professionalism and attention to detail made a huge difference on our site.",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        id: 2,
        name: "Jane Smith",
        role: "Owner, Smith Developers",
        quote:
            "We’ve used their land development services for three projects now. Always reliable, always within budget. Highly recommended!",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        id: 3,
        name: "Michael Lee",
        role: "Site Supervisor, Urban Builders",
        quote:
            "The equipment leasing process was seamless – well‑maintained machinery and excellent support. We’ll definitely rent from them again.",
        avatar: "https://randomuser.me/api/portraits/men/62.jpg",
    },
];

// ---------- CountUp Component ----------
const CountUp = ({ end, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        let startTime;
        let rafId;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                rafId = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [isVisible, end, duration]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
};

// ---------- Floating Infinity Icon (with hover effect and click counter) ----------
const FloatingInfinityIcon = forwardRef(
    ({ className, floatClass, animClass, iconClass, onClick }, ref) => {
        const [isHovered, setIsHovered] = useState(false);
        const iconRef = useRef(null);
        const targetRef = useRef({ x: 0, y: 0, rotate: 0 });
        const currentRef = useRef({ x: 0, y: 0, rotate: 0 });
        const rafRef = useRef(null);
        const SMOOTHING = 0.12;

        const animate = useCallback(() => {
            const { x: tx, y: ty, rotate: tr } = targetRef.current;
            let { x, y, rotate } = currentRef.current;

            const newX = x + (tx - x) * SMOOTHING;
            const newY = y + (ty - y) * SMOOTHING;

            let rotDiff = tr - rotate;
            if (rotDiff > 180) rotDiff -= 360;
            if (rotDiff < -180) rotDiff += 360;
            const newRot = rotate + rotDiff * SMOOTHING;

            currentRef.current = { x: newX, y: newY, rotate: newRot };

            if (iconRef.current) {
                iconRef.current.style.transform = `translate(${newX}px, ${newY}px) rotate(${newRot}deg)`;
            }

            if (
                Math.abs(newX - tx) > 0.1 ||
                Math.abs(newY - ty) > 0.1 ||
                Math.abs(newRot - tr) > 0.1
            ) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                currentRef.current = { x: tx, y: ty, rotate: tr };
                if (iconRef.current) {
                    iconRef.current.style.transform = `translate(${tx}px, ${ty}px) rotate(${tr}deg)`;
                }
                rafRef.current = null;
            }
        }, []);

        const startAnimation = useCallback(() => {
            if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(animate);
            }
        }, [animate]);

        useEffect(() => {
            return () => {
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                    rafRef.current = null;
                }
            };
        }, []);

        useEffect(() => {
            if (!isHovered) {
                targetRef.current = { x: 0, y: 0, rotate: 0 };
                startAnimation();
            }
        }, [isHovered, startAnimation]);

        const handleMouseMove = (e) => {
            if (!iconRef.current) return;
            const rect = iconRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = centerX - e.clientX;
            const dy = centerY - e.clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1) {
                targetRef.current = { x: 0, y: 0, rotate: 0 };
            } else {
                const dirX = dx / distance;
                const dirY = dy / distance;
                const maxPush = 20;
                const pushDistance = Math.min(
                    maxPush,
                    maxPush * (1 / (distance * 0.1 + 0.5))
                );
                const newX = dirX * pushDistance;
                const newY = dirY * pushDistance;
                const angle = Math.atan2(dirY, dirX) * (180 / Math.PI);
                targetRef.current = { x: newX, y: newY, rotate: angle };
            }
            startAnimation();
        };

        return (
            <div ref={ref} className={`${className} ${floatClass} ${animClass}`}>
                <div
                    ref={iconRef}
                    className="inline-block will-change-transform"
                    style={{ transform: "translate(0px, 0px) rotate(0deg)" }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onMouseMove={handleMouseMove}
                    onClick={onClick}
                >
                    <LuInfinity className={iconClass} />
                </div>
            </div>
        );
    }
);

FloatingInfinityIcon.displayName = "FloatingInfinityIcon";

// ---------- Services Data ----------
const allServices = [
    {
        title: "Backfill & Land Sourcing",
        subDescription: "Premium backfilling materials for stable foundations.",
        fullDescription:
            "We supply high-quality sub-base, aggregates, boulders, and other land resources tailored to client specifications. Our materials meet rigorous standards to ensure long-lasting results.",
        outcome:
            "Projects benefit from reduced settlement, improved load-bearing capacity, and cost efficiency.",
        image:
            "https://images.pexels.com/photos/95687/pexels-photo-95687.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
    },
    {
        title: "Land Development",
        subDescription: "Comprehensive site preparation and development.",
        fullDescription:
            "From clearing and cutting to leveling and grading, we transform raw land into construction-ready sites. Our team uses advanced equipment and techniques to handle projects of any scale.",
        outcome:
            "Sites are delivered on time, fully compliant with regulations, and optimized for subsequent construction.",
        image: silang_img_1,
    },
    {
        title: "Site Management",
        subDescription: "Professional on‑site supervision and coordination.",
        fullDescription:
            "We provide experienced site managers who oversee daily operations, ensure safety compliance, coordinate subcontractors, and maintain project schedules.",
        outcome: "Smoother workflows, fewer delays, and enhanced safety on every project.",
        image:
            "https://images.pexels.com/photos/544965/pexels-photo-544965.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
    },
    {
        title: "Equipment Leasing",
        subDescription: "Reliable machinery for your project needs.",
        fullDescription:
            "We offer a wide range of construction equipment for lease – from excavators to compactors – all well‑maintained and delivered to your site.",
        outcome:
            "Cost‑effective access to top‑quality equipment without the capital investment.",
        image:
            "https://images.pexels.com/photos/38070/pexels-photo-38070.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
    },
    {
        title: "Project Management Consultation",
        subDescription: "Expert guidance from planning to execution.",
        fullDescription:
            "Our consultants work alongside your team to plan, coordinate, and oversee every phase of your project, ensuring alignment with budget, timeline, and quality goals.",
        outcome:
            "Projects are delivered with greater efficiency, fewer risks, and optimized resource use.",
        image:
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
];

// ---------- Animated Service Section ----------
const AnimatedServiceSection = ({ service, index, animConfig }) => {
    const [sectionRef, , isVisible] = useScrollAnimation(0.3, true, 0);
    return (
        <div ref={sectionRef}>
            <ServiceFullViewportSection
                service={service}
                index={index}
                active={isVisible}
                animConfig={animConfig}
            />
        </div>
    );
};

// Desktop: Odd index (1,3,5) = Image LEFT | Even index (0,2,4) = Image RIGHT
// Mobile: Always Image TOP / Content BOTTOM
function ServiceFullViewportSection({ service, index, active, animConfig }) {
    const numberStr = (index + 1).toString().padStart(2, "0");
    const delays = [
        0,
        animConfig.paragraphStagger,
        animConfig.paragraphStagger * 2,
        animConfig.paragraphStagger * 3,
        animConfig.paragraphStagger * 4,
        animConfig.paragraphStagger * 5,
    ];

    const isEvenIndex = index % 2 === 0;
    const desktopFlexClass = isEvenIndex ? "md:flex-row-reverse" : "md:flex-row";

    return (
        <section className="relative w-full bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto w-full border border-gray-200 dark:border-gray-700">
                <div className={`flex flex-col ${desktopFlexClass}`}>
                    {/* IMAGE SECTION */}
                    <div className="relative w-full md:w-2/5 h-56 sm:h-64 md:h-auto min-h-[200px] md:min-h-0 overflow-hidden order-1 md:order-none">
                        <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <BlockReveal active={active} rows={8} cols={12} />
                    </div>

                    {/* INFO SECTION */}
                    <div className="w-full md:w-3/5 flex flex-col justify-start px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12 order-2 md:order-none">
                        <div className="max-w-xl mx-auto md:mx-0">
                            {/* Service Number Badge */}
                            <div
                                className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold text-base sm:text-xl mb-3 sm:mb-4 transition-all duration-700 ease-out"
                                style={{
                                    opacity: active ? 1 : 0,
                                    transform: active ? 'translateY(0)' : 'translateY(20px)',
                                    transitionDelay: `${delays[0]}s`,
                                }}
                            >
                                {numberStr}
                            </div>

                            {/* Service Title */}
                            <h3
                                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-1 sm:mt-2 mb-3 sm:mb-4 transition-all duration-700 ease-out"
                                style={{
                                    opacity: active ? 1 : 0,
                                    transform: active ? 'translateY(0)' : 'translateY(20px)',
                                    transitionDelay: `${delays[1]}s`,
                                }}
                            >
                                {service.title}
                            </h3>

                            {/* Sub Description */}
                            <p
                                className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium mb-3 sm:mb-4 text-justify transition-all duration-700 ease-out"
                                style={{
                                    opacity: active ? 1 : 0,
                                    transform: active ? 'translateY(0)' : 'translateY(20px)',
                                    transitionDelay: `${delays[2]}s`,
                                }}
                            >
                                {service.subDescription}
                            </p>

                            {/* Full Description */}
                            <p
                                className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6 text-justify transition-all duration-700 ease-out"
                                style={{
                                    opacity: active ? 1 : 0,
                                    transform: active ? 'translateY(0)' : 'translateY(20px)',
                                    transitionDelay: `${delays[3]}s`,
                                }}
                            >
                                {service.fullDescription}
                            </p>

                            {/* Outcome Section */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                                <h4
                                    className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 transition-all duration-700 ease-out"
                                    style={{
                                        opacity: active ? 1 : 0,
                                        transform: active ? 'translateY(0)' : 'translateY(20px)',
                                        transitionDelay: `${delays[4]}s`,
                                    }}
                                >
                                    Outcome
                                </h4>
                                <p
                                    className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-justify transition-all duration-700 ease-out"
                                    style={{
                                        opacity: active ? 1 : 0,
                                        transform: active ? 'translateY(0)' : 'translateY(20px)',
                                        transitionDelay: `${delays[5]}s`,
                                    }}
                                >
                                    {service.outcome}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ---------- Main Home Component ----------
export default function Home({ introDone = true }) {
    const navigate = useNavigate();

    // Separate click counters for left and right infinity icons
    const [leftClickCount, setLeftClickCount] = useState(0);
    const [rightClickCount, setRightClickCount] = useState(0);

    // Left icon → 4 clicks → 404 page
    useEffect(() => {
        if (leftClickCount >= 4) {
            navigate("/404");
            setLeftClickCount(0);
        }
    }, [leftClickCount, navigate]);

    // Right icon → 4 clicks → login page
    useEffect(() => {
        if (rightClickCount >= 4) {
            navigate("/login");
            setRightClickCount(0);
        }
    }, [rightClickCount, navigate]);

    const handleLeftClick = useCallback(() => {
        setLeftClickCount(prev => prev + 1);
    }, []);

    const handleRightClick = useCallback(() => {
        setRightClickCount(prev => prev + 1);
    }, []);

    const ANIM_CONFIG = {
        duration: "0.8s",
        easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        staggerBase: 0.6,
        paragraphStagger: 0.4,
    };

    const fadeUpStyle = (visible, delay) => ({
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity ${ANIM_CONFIG.duration} ${ANIM_CONFIG.easing}, transform ${ANIM_CONFIG.duration} ${ANIM_CONFIG.easing}`,
        transitionDelay: `${delay}s`,
    });

    const [buttonsRef, buttonsAnim] = useScrollAnimation(0.1, introDone);
    const [float1Ref, float1Anim] = useScrollAnimation(0.1, introDone);
    const [float2Ref, float2Anim] = useScrollAnimation(0.1, introDone);
    const [introRef, introAnim] = useScrollAnimation(0.1, introDone);
    const [mvHeadingRef, mvHeadingAnim] = useScrollAnimation(0.1, introDone);
    const [whatWeDoHeadingRef, whatWeDoHeadingVisible] = useScrollAnimation(0.1, introDone);
    const [coreServicesRef, coreServicesVisible] = useScrollAnimation(0.1, introDone);
    const [whyRef, whyVisible] = useScrollAnimation(0.1, introDone);
    const [ctaContentRef, ctaContentVisible] = useScrollAnimation(0.1, introDone);
    const [testimonialsRef, testimonialsVisible] = useScrollAnimation(0.1, introDone);

    const [headingRevealed, setHeadingRevealed] = useState(false);

    useEffect(() => {
        if (introDone) {
            const headingTimer = setTimeout(() => setHeadingRevealed(true), 200);
            return () => clearTimeout(headingTimer);
        }
    }, [introDone]);

    useEffect(() => {
        const setVh = () => {
            document.documentElement.style.setProperty(
                "--vh",
                `${window.innerHeight * 0.01}px`
            );
        };
        setVh();
        window.addEventListener("resize", setVh);
        return () => window.removeEventListener("resize", setVh);
    }, []);

    return (
        <>
            {/* ========== HERO SECTION ========== */}
            <section
                id="home"
                className="relative text-white px-4 sm:px-6 md:px-10 lg:px-16 overflow-hidden transition-all duration-1000 flex items-center"
                style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}
            >
                {/* Background with image always visible */}
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-fixed"
                        style={{ backgroundImage: `url(${office})` }}
                    />
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="max-w-6xl w-full mx-auto relative z-10 text-left">
                    <h1
                        className="font-bold leading-tight mb-4 sm:mb-6 drop-shadow-lg"
                        style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
                    >
                        <LetterReveal
                            active={headingRevealed}
                            lines={["Building Excellence,", "Delivering Trust"]}
                            letterDelay={0.05}
                        />
                    </h1>
                    <div
                        ref={buttonsRef}
                        className={`mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 ${buttonsAnim}`}
                    >
                        <button
                            onClick={() => navigate("/contact")}
                            className="w-full sm:w-auto bg-green-400 hover:bg-green-500 text-[#0b2545] dark:text-gray-900 px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-sm font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300"
                        >
                            Request a Quote
                        </button>
                        <button
                            onClick={() => navigate("/projects")}
                            className="w-full sm:w-auto border-2 border-white text-white hover:text-green-400 hover:border-green-400 px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-sm font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white"
                        >
                            View Projects
                        </button>
                    </div>

                    {/* Desktop infinity icons */}
                    <FloatingInfinityIcon
                        ref={float1Ref}
                        className="absolute top-1/4 right-0 hidden lg:block"
                        floatClass="animate-float"
                        animClass={float1Anim}
                        iconClass="w-12 h-12 lg:w-16 lg:h-16 text-green-400 opacity-20"
                        onClick={handleRightClick}   // right icon
                    />
                    <FloatingInfinityIcon
                        ref={float2Ref}
                        className="absolute bottom-1/4 left-0 animation-delay-1000 hidden lg:block"
                        floatClass="animate-float"
                        animClass={float2Anim}
                        iconClass="w-10 h-10 lg:w-14 lg:h-14 text-white opacity-30"
                        onClick={handleLeftClick}    // left icon
                    />
                    {/* Mobile infinity icon */}
                    <FloatingInfinityIcon
                        className="absolute bottom-1/4 right-0 block lg:hidden"
                        floatClass="animate-float"
                        animClass=""
                        iconClass="w-10 h-10 text-green-400 opacity-30"
                        onClick={handleRightClick}   // right icon on mobile as well
                    />
                </div>
            </section>

            {/* ========== WHAT WE DO ========== */}
            <section
                ref={introRef}
                className={`relative px-6 md:px-16 lg:px-24 py-20 md:py-24 bg-transparent transition-all duration-1000 ${introAnim} overflow-hidden`}
            >
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div
                        ref={mvHeadingRef}
                        className={`text-center transition-all duration-1000 ${mvHeadingAnim}`}
                    >
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <div className="h-px w-16 bg-green-300 dark:bg-green-600"></div>
                            <FaInfinity className="text-gray-600 dark:text-gray-400 text-2xl" />
                            <div className="h-px w-16 bg-blue-300 dark:bg-blue-600"></div>
                        </div>
                    </div>
                    <h2
                        ref={whatWeDoHeadingRef}
                        style={fadeUpStyle(whatWeDoHeadingVisible, 0)}
                        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6"
                    >
                        What We Do
                    </h2>
                    <ScrollReveal baseOpacity={0.1} enableBlur baseRotation={3} blurStrength={4}>
                        At Cliberduche, we turn vision into reality through a comprehensive range of
                        construction and land development services. Backed by years of experience and
                        an unwavering commitment to excellence, we deliver trust on every project —
                        from material sourcing and site development to expert consultation. Our
                        integrated approach ensures that your project is built on a solid foundation,
                        literally and figuratively.
                    </ScrollReveal>
                </div>
            </section>

            {/* ========== OUR CORE SERVICES HEADER ========== */}
            <section
                ref={coreServicesRef}
                className={`relative px-6 md:px-16 lg:px-24 py-20 md:py-24 bg-transparent transition-all duration-1000 overflow-hidden`}
            >
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px w-16 bg-green-300 dark:bg-green-600"></div>
                        <FaInfinity className="text-green-600 dark:text-green-400 text-2xl" />
                        <h3
                            style={fadeUpStyle(coreServicesVisible, 0)}
                            className="text-4xl font-bold text-gray-900 dark:text-gray-100"
                        >
                            Our Core Services
                        </h3>
                    </div>
                    <p
                        style={fadeUpStyle(coreServicesVisible, ANIM_CONFIG.paragraphStagger)}
                        className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl"
                    >
                        The foundation of our work — essential services we execute with precision,
                        reliability, and proven expertise.
                    </p>
                </div>
            </section>

            {/* ========== FULL-VIEWPORT SERVICE SECTIONS ========== */}
            {allServices.map((service, index) => (
                <AnimatedServiceSection
                    key={index}
                    service={service}
                    index={index}
                    animConfig={ANIM_CONFIG}
                />
            ))}

            {/* ========== STATS ========== */}
            <section
                ref={whyRef}
                className={`relative px-6 md:px-16 lg:px-24 py-24 bg-transparent transition-all duration-1000 overflow-hidden`}
            >
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2
                            style={fadeUpStyle(whyVisible, 0)}
                            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                        >
                            Our Impact by Numbers
                        </h2>
                        <div
                            style={fadeUpStyle(whyVisible, ANIM_CONFIG.paragraphStagger)}
                            className="flex justify-center items-center gap-2"
                        >
                            <div className="h-px w-16 bg-green-300 dark:bg-green-600"></div>
                            <FaInfinity className="text-gray-600 dark:text-gray-400 text-2xl" />
                            <div className="h-px w-16 bg-blue-300 dark:bg-blue-600"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-start">
                        <div
                            style={fadeUpStyle(whyVisible, 0 * ANIM_CONFIG.staggerBase)}
                            className="relative pl-6 border-l-8 border-green-600"
                        >
                            <h4 className="text-7xl font-bold text-green-600 dark:text-green-400 mb-2 leading-none">
                                <CountUp end={new Date().getFullYear() - 2018} suffix="+" />
                            </h4>
                            <h5 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                Years of Proven Experience
                            </h5>
                            <p className="text-gray-600 dark:text-gray-400 text-base">
                                Since 2018, we have successfully supported land development and
                                construction projects across CALABARZON with reliable execution.
                            </p>
                        </div>
                        <div
                            style={fadeUpStyle(whyVisible, 1 * ANIM_CONFIG.staggerBase)}
                            className="text-center"
                        >
                            <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-4 border-blue-600/30 bg-blue-50 dark:bg-blue-900/20 mb-4">
                                <span className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                                    <CountUp end={14} suffix="M" />
                                </span>
                            </div>
                            <h5 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                Cubic Meters of Material
                            </h5>
                            <p className="text-gray-600 dark:text-gray-400 text-base">
                                Company‑owned land ensures abundant supply and cost efficiency for
                                projects of any scale.
                            </p>
                        </div>
                        <div
                            style={fadeUpStyle(whyVisible, 2 * ANIM_CONFIG.staggerBase)}
                            className="relative"
                        >
                            <div className="absolute top-0 right-0 text-green-100 dark:text-green-900/30 text-9xl select-none">
                                <FaLeaf />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-7xl font-bold text-green-600 dark:text-green-400 mb-2">
                                    <CountUp end={100} suffix="%" />
                                </h4>
                                <h5 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                    Eco‑Compliant Operations
                                </h5>
                                <p className="text-gray-600 dark:text-gray-400 text-base">
                                    We strictly adhere to environmental regulations and sustainable
                                    development practices.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== TESTIMONIALS (Minimalist, no cards) ========== */}
            <section
                ref={testimonialsRef}
                className={`relative px-6 md:px-16 lg:px-24 py-24 bg-transparent transition-all duration-1000 overflow-hidden`}
            >
                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2
                            style={fadeUpStyle(testimonialsVisible, 0)}
                            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                        >
                            What Our Clients Say
                        </h2>
                        <div
                            style={fadeUpStyle(testimonialsVisible, ANIM_CONFIG.paragraphStagger)}
                            className="flex justify-center items-center gap-2"
                        >
                            <div className="h-px w-16 bg-green-300 dark:bg-green-600"></div>
                            <FaInfinity className="text-gray-600 dark:text-gray-400 text-2xl" />
                            <div className="h-px w-16 bg-blue-300 dark:bg-blue-600"></div>
                        </div>
                    </div>

                    {/* Testimonials Grid - Minimalist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.id}
                                style={fadeUpStyle(
                                    testimonialsVisible,
                                    (index + 1) * ANIM_CONFIG.paragraphStagger
                                )}
                                className="relative"
                            >
                                {/* Large quotation mark as background element */}
                                <div className="absolute -top-6 -left-4 text-8xl font-serif text-gray-200 dark:text-gray-700 select-none z-0">
                                    “
                                </div>
                                <div className="relative z-10">
                                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 italic">
                                        {testimonial.quote}
                                    </p>
                                    <div className="flex items-center">
                                        {testimonial.avatar && (
                                            <img
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                                className="w-12 h-12 rounded-full mr-4 object-cover"
                                            />
                                        )}
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">
                                                {testimonial.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== CALL TO ACTION ========== */}
            <section className="relative px-6 md:px-16 lg:px-24 py-16 md:py-20 text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')`,
                        }}
                    />
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>
                <div
                    ref={ctaContentRef}
                    className={`relative z-10 max-w-4xl mx-auto text-center transition-all duration-1000`}
                >
                    <h3
                        style={fadeUpStyle(ctaContentVisible, 0)}
                        className="text-3xl md:text-4xl font-bold mb-6"
                    >
                        Ready to Start Your Project?
                    </h3>
                    <p
                        style={fadeUpStyle(ctaContentVisible, ANIM_CONFIG.paragraphStagger)}
                        className="text-xl text-gray-200 dark:text-gray-300 mb-8"
                    >
                        Let's discuss how our services can bring your vision to life.
                    </p>

                    <div
                        style={fadeUpStyle(ctaContentVisible, ANIM_CONFIG.paragraphStagger * 2)}
                    >
                        <MagneticButton
                            padding={80}
                            magnetStrength={3}
                            wrapperClassName="inline-block"
                        >
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-sm text-lg font-semibold transition-colors duration-300"
                            >
                                <FaPhoneAlt className="w-5 h-5" />
                                Contact Us Today
                            </Link>
                        </MagneticButton>
                    </div>
                </div>
            </section>
        </>
    );
}