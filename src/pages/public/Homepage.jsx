import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Intro from "./Intro";
import Home from "./Home";
import About from "./About";
import Contact from "./Contact";
import Projects from "./Projects";
import Footer from "../../components/Footer";
import SmoothScroll from "../../components/SmoothScroll";
import NotFound from "./NotFound";
import "./Homepage.css";

export default function Homepage() {
    const [introPlaying, setIntroPlaying] = useState(true);
    const introDone = !introPlaying;
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        const event = new CustomEvent("smooth-scroll-set-target", {
            detail: { value: 0, smooth: false }
        });
        window.dispatchEvent(event);
    }, [pathname]);

    const isHome = pathname === "/";
    const noTopPadding = isHome || pathname === "/projects" || pathname === "/about";

    return (
        <div className="site-wrapper">
            {/* FIXED GRID BACKGROUND REMOVED FROM HERE */}

            <Navbar introDone={introDone} />

            <SmoothScroll ease={0.08} className="smooth-scroll">
                {introPlaying && (
                    <Intro
                        title="Cliberduche"
                        onFinish={() => setIntroPlaying(false)}
                    />
                )}

                <main className={noTopPadding ? "" : "pt-16 md:pt-20"}>
                    <Routes>
                        <Route index element={<Home introDone={introDone} />} />
                        <Route path="/about" element={<About introDone={introDone} />} />
                        <Route path="/projects" element={<Projects introDone={introDone} />} />
                        <Route path="/contact" element={<Contact introDone={introDone} />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>

                <Footer introDone={introDone} />
            </SmoothScroll>
        </div>
    );
}