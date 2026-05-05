import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const ChromaGrid = ({ items = [], className = '', radius = 300, damping = 0.45, fadeOut = 0.6, ease = 'power3.out' }) => {
    const rootRef = useRef(null);
    const fadeRef = useRef(null);
    const setX = useRef(null);
    const setY = useRef(null);
    const pos = useRef({ x: 0, y: 0 });

    if (!items.length) return null;

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        setX.current = gsap.quickSetter(el, '--x', 'px');
        setY.current = gsap.quickSetter(el, '--y', 'px');
        const { width, height } = el.getBoundingClientRect();
        pos.current = { x: width / 2, y: height / 2 };
        setX.current(pos.current.x);
        setY.current(pos.current.y);
    }, []);

    const moveTo = (x, y) => {
        gsap.to(pos.current, {
            x,
            y,
            duration: damping,
            ease,
            onUpdate: () => {
                setX.current?.(pos.current.x);
                setY.current?.(pos.current.y);
            },
            overwrite: true
        });
    };

    const handleMove = e => {
        const r = rootRef.current.getBoundingClientRect();
        moveTo(e.clientX - r.left, e.clientY - r.top);
        gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
    };

    const handleLeave = () => {
        gsap.to(fadeRef.current, {
            opacity: 1,
            duration: fadeOut,
            overwrite: true
        });
    };

    const handleCardClick = url => {
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleCardMove = e => {
        const c = e.currentTarget;
        const rect = c.getBoundingClientRect();
        c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };

    return (
        <div
            ref={rootRef}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            className={`relative w-full h-full ${className}`}
            style={{
                '--r': `${radius}px`,
                '--x': '50%',
                '--y': '50%'
            }}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c, i) => (
                    <article
                        key={i}
                        onMouseMove={handleCardMove}
                        onClick={() => handleCardClick(c.url)}
                        className="group relative aspect-[4/5] overflow-hidden border-2 border-transparent transition-colors duration-300 cursor-pointer"
                        style={{
                            '--card-border': c.borderColor || 'transparent',
                            background: c.gradient,
                            '--spotlight-color': 'rgba(255,255,255,0.3)'
                        }}
                    >
                        <div
                            className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
                            style={{
                                background:
                                    'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)'
                            }}
                        />
                        <img
                            src={c.image}
                            alt={c.title}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <footer
                            className="absolute bottom-0 left-0 right-0 z-10 p-4 text-white font-sans 
                                       bg-gradient-to-t from-black/80 to-transparent
                                       translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                        >
                            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                                <h3 className="m-0 text-[1.05rem] font-semibold">{c.title}</h3>
                                {c.handle && <span className="text-[0.95rem] opacity-80 text-right">{c.handle}</span>}
                                <p className="m-0 text-[0.85rem] opacity-85 col-span-2">{c.subtitle}</p>
                                {c.brief && (
                                    <p className="m-0 text-[0.75rem] opacity-75 col-span-2">
                                        {c.brief}
                                    </p>
                                )}
                                {c.location && <span className="text-[0.85rem] opacity-85 col-span-2">{c.location}</span>}
                            </div>
                        </footer>
                    </article>
                ))}
            </div>

            <div
                className="absolute inset-0 pointer-events-none z-30"
                style={{
                    backdropFilter: 'grayscale(1) brightness(0.78)',
                    WebkitBackdropFilter: 'grayscale(1) brightness(0.78)',
                    background: 'rgba(0,0,0,0.001)',
                    maskImage:
                        'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)',
                    WebkitMaskImage:
                        'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)'
                }}
            />
            <div
                ref={fadeRef}
                className="absolute inset-0 pointer-events-none transition-opacity duration-[250ms] z-40"
                style={{
                    backdropFilter: 'grayscale(1) brightness(0.78)',
                    WebkitBackdropFilter: 'grayscale(1) brightness(0.78)',
                    background: 'rgba(0,0,0,0.001)',
                    maskImage:
                        'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)',
                    WebkitMaskImage:
                        'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)',
                    opacity: 1
                }}
            />
        </div>
    );
};

export default ChromaGrid;