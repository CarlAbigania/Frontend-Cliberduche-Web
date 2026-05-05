import React, { useState, useEffect } from "react";
import {
  FaBolt,
  FaEye,
  FaShieldAlt,
  FaCheckCircle,
  FaBalanceScale,
  FaInfinity,
  FaArrowDown,
} from "react-icons/fa";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import { BlockReveal, LetterReveal } from "../../components/RevealAnimations";
import PortfolioHero from "../../components/PortfolioHero";
import ChromaGrid from "../../components/ChromaGrid";

import northport_img from "/projects/northport_ongoing/northport_img_1.png";
import Rolando from "/teamMembers/RolandoS.Climaco.jpg"; //  President
import MariaBella from "/teamMembers/MariaBellaJ.Climaco.jpg"; // Vice President
import Rolisdio from "/teamMembers/RolisdioS.Climaco.jpg"; // Safety Officer
import Benilda from "/teamMembers/BenildaPadilla.jpg"; //  Purchasing Head
import Ofelia from "/teamMembers/OfeliaMacaldo.jpg"; // HR Admin
import Christina from "/teamMembers/Ma.CristinaDino.jpg"; // Accounting Head
import Genesis from "/teamMembers/GenesisEmmanuelDeGuzman.jpg"; // Project Manager
import Kathleen from "/teamMembers/KatleenMaeC.Martinez.jpg";  //  QA/QC Engineer

export default function About({ introDone = true }) {
  // ========== ANIMATION CONFIGURATION ==========
  const ANIM_CONFIG = {
    duration: "0.8s",
    easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    staggerBase: 0.6,
    paragraphStagger: 0.6,
  };

  // Scroll animation refs
  const [companyRef, companyAnim, companyVisible] = useScrollAnimation(0.1, introDone);
  const [projectsRef, projectsAnim, projectsVisible] = useScrollAnimation(0.1, introDone);
  const [mvHeadingRef, mvHeadingAnim] = useScrollAnimation(0.1, introDone);
  const [missionRef, missionAnim, missionVisible] = useScrollAnimation(0.1, introDone);
  const [visionRef, visionAnim, visionVisible] = useScrollAnimation(0.1, introDone);
  const [valuesRef, valuesAnim, valuesVisible] = useScrollAnimation(0.1, introDone);
  const [leadershipRef, leadershipAnim, leadershipVisible] = useScrollAnimation(0.1, introDone);
  const [insightsRef, insightsAnim, insightsVisible] = useScrollAnimation(0.1, introDone);
  const [portfolioRef, portfolioAnim, portfolioVisible] = useScrollAnimation(0.1, introDone);

  // Hero animations
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [textRevealed, setTextRevealed] = useState(false);

  useEffect(() => {
    if (introDone) {
      const blockTimer = setTimeout(() => setHeroRevealed(true), 100);
      const textTimer = setTimeout(() => setTextRevealed(true), 200);
      return () => {
        clearTimeout(blockTimer);
        clearTimeout(textTimer);
      };
    }
  }, [introDone]);

  const fadeUpStyle = (visible, delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity ${ANIM_CONFIG.duration} ${ANIM_CONFIG.easing}, transform ${ANIM_CONFIG.duration} ${ANIM_CONFIG.easing}`,
    transitionDelay: `${delay}s`,
  });

  // ========== REAL TEAM DATA (using imported images) ==========
  const realTeamMembers = [
    {
      name: "Rolando S. Climaco",
      title: "President",
      brief:
        "Leads the company with strategic vision and decades of experience in construction and land development.",
      imageUrl: Rolando,
    },
    {
      name: "Maria Bella J. Climaco",
      title: "Vice President",
      brief:
        "Oversees operations and community relations, ensuring family values and sustainable practices guide every project.",
      imageUrl: MariaBella,
    },
    {
      name: "Rolisdio S. Climaco",
      title: "Safety Officer",
      brief:
        "Ensures strict adherence to safety protocols on all sites, promoting a culture of safety first.",
      imageUrl: Rolisdio,
    },
    {
      name: "Benilda Padilla",
      title: "Purchasing Head",
      brief:
        "Manages procurement of materials and resources, ensuring quality and cost-efficiency.",
      imageUrl: Benilda,
    },
    {
      name: "Ofelia Macaldo",
      title: "HR Admin",
      brief:
        "Handles human resources and administrative functions, fostering a supportive work environment.",
      imageUrl: Ofelia,
    },
    {
      name: "Ma. Cristina Dino",
      title: "Accounting Head",
      brief:
        "Oversees financial management and accounting, ensuring transparency and fiscal responsibility.",
      imageUrl: Christina,
    },
    {
      name: "Genesis Emmanuel De Guzman",
      title: "Project Manager",
      brief:
        "Coordinates project execution, ensuring timelines, quality, and client satisfaction.",
      imageUrl: Genesis,
    },
    {
      name: "Katleen Mae C. Martinez",
      title: "QA/QC Engineer",
      brief:
        "Implements quality assurance and control processes to meet regulatory and client standards.",
      imageUrl: Kathleen,
    },
  ];

  // ========== TRANSFORM TEAM DATA FOR CHROMA GRID ==========
  const teamColors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"]; // indigo, green, orange, red

  const teamDataForChroma = realTeamMembers.map((member, index) => {
    const color = teamColors[index % teamColors.length];
    const handle =
      "@" +
      member.name
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
    return {
      image: member.imageUrl,
      title: member.name,
      subtitle: member.title,
      handle: handle,
      brief: member.brief,
      borderColor: color,
      gradient: `linear-gradient(145deg, ${color}, #000)`,
      url: "",
    };
  });

  return (
    <>
      {/* ========== MOBILE/TABLET HERO ========== */}
      <div className="relative min-h-screen overflow-hidden lg:hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')`,
          }}
        >
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/30" />
          <BlockReveal active={heroRevealed} rows={8} cols={12} />
        </div>
        <div className="absolute inset-0 flex flex-col justify-center items-start p-6 md:p-12 bg-transparent">
          <div className="text-sm tracking-[0.3em] uppercase text-white/80 mb-3">About</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            <LetterReveal
              active={textRevealed}
              lines={["CLIBERDUCHE", "CORPORATION"]}
              letterDelay={0.05}
            />
          </h1>
        </div>
      </div>

      {/* ========== DESKTOP HERO ========== */}
      <div className="hidden lg:flex flex-col md:flex-row min-h-screen md:h-screen">
        <div className="relative w-full md:w-1/2 h-96 md:h-full order-2 md:order-1 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')`,
              backgroundPosition: "left center",
            }}
          >
            {/* Dark overlay for better text visibility */}
            <div className="absolute inset-0 bg-black/30" />
            <BlockReveal active={heroRevealed} rows={8} cols={12} />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col order-1 md:order-2">
          <div className="hidden md:block flex-1" />
          <div className="pt-20 md:pt-0 pb-16 md:pb-20 px-6 md:px-12">
            <div className="text-sm tracking-[0.3em] uppercase text-gray-600 dark:text-gray-400 mb-3">About</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              <LetterReveal
                active={textRevealed}
                lines={["CLIBERDUCHE", "CORPORATION"]}
                letterDelay={0.05}
              />
            </h1>
          </div>
          <div className="hidden md:block flex-1" />
        </div>
      </div>

      {/* ========== COMPANY STORY ========== */}
      <section
        id="company"
        ref={companyRef}
        className={`relative px-6 md:px-10 py-16 md:py-20 bg-transparent transition-all duration-1000 ${companyAnim} overflow-hidden`}
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-16 bg-green-300 dark:bg-green-600"></div>
                <FaInfinity className="text-green-600 dark:text-green-400 text-2xl" />
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">The Company</h3>
              </div>
              <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p style={fadeUpStyle(companyVisible, 0 * ANIM_CONFIG.paragraphStagger)}>
                  Established in 2018, CLIBERDUCHE CORPORATION was born out of the dream of a person
                  to provide the best for his family without leaving the country anymore. This person
                  found this opportunity in the wide field of the construction business. Immediately,
                  he invited his friends to join him and officially registered CLIBERDUCHE CORPORATION
                  with the Securities and Exchange Commission on November 28, 2018.
                </p>
                <p style={fadeUpStyle(companyVisible, 1 * ANIM_CONFIG.paragraphStagger)}>
                  <strong>CLIBERDUCHE</strong> stands for the surnames of the founder and co-founders:
                </p>
                <ul style={fadeUpStyle(companyVisible, 2 * ANIM_CONFIG.paragraphStagger)} className="list-disc list-inside pl-4 space-y-1 text-gray-700 dark:text-gray-300">
                  <li>CLImaco</li>
                  <li>BERonilla</li>
                  <li>PiaDUCHE</li>
                </ul>
                <p style={fadeUpStyle(companyVisible, 3 * ANIM_CONFIG.paragraphStagger)}>
                  As time passed, the other two incorporators (Beronilla and Piaduche) ventured into
                  other areas of interest. They all agreed to officially part ways. The founder’s spouse
                  and brother became the new directors, carrying forward the original mission with renewed focus.
                </p>
                <p style={fadeUpStyle(companyVisible, 4 * ANIM_CONFIG.paragraphStagger)}>
                  Today, CLIBERDUCHE CORPORATION provides high-quality backfill materials—sub-base,
                  aggregates, and boulders—to clients across the CALABARZON area and beyond. Our
                  company-owned land development sites in Laguna and Cavite contain over{" "}
                  <strong>14 million cubic meters</strong> of materials, enabling us to support projects
                  of any scale while adhering to DENR regulations and sustainable practices.
                </p>
                <p style={fadeUpStyle(companyVisible, 5 * ANIM_CONFIG.paragraphStagger)}>
                  As client needs expanded, we grew into a one-stop shop offering General Engineering,
                  Civil Works, and Construction & Development for both horizontal and vertical projects.
                  We remain committed to eco-friendly operations and building lasting relationships with
                  communities, clients, and partners.
                </p>
              </div>
            </div>
            <div
              className="relative h-96 md:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl"
              style={fadeUpStyle(companyVisible, 0)}
            >
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                alt="Construction site with heavy machinery"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== PROJECTS & EXPERTISE ========== */}
      <section
        id="projects"
        ref={projectsRef}
        className={`relative px-6 md:px-10 py-16 md:py-20 bg-transparent transition-all duration-1000 ${projectsAnim} overflow-hidden`}
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 md:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
              <img
                src={northport_img}
                alt="Bridge construction project"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <BlockReveal active={projectsVisible} rows={8} cols={12} />
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-4 mb-4 justify-end md:justify-start">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">Projects & Expertise</h3>
                <FaInfinity className="text-blue-600 dark:text-blue-400 text-2xl" />
                <div className="h-px w-16 bg-blue-300 dark:bg-blue-600"></div>
              </div>
              <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed text-left">
                <p style={fadeUpStyle(projectsVisible, 0 * ANIM_CONFIG.paragraphStagger)}>
                  CLIBERDUCHE CORPORATION handles a diverse range of projects—from small-scale to large
                  commercial and industrial developments. We specialize in supplying backfilling materials,
                  aggregates, and other land resources tailored to client specifications.
                </p>
                <p style={fadeUpStyle(projectsVisible, 1 * ANIM_CONFIG.paragraphStagger)}>
                  Our land development capabilities include clearing, cutting and peeling, levelling, and
                  RCP/PVC pipe laying. We have also built bridges, concrete roads, gutters, ripraps,
                  easements, and slope protection systems addressing erosion prevention and soil liquefaction.
                </p>
                <p style={fadeUpStyle(projectsVisible, 2 * ANIM_CONFIG.paragraphStagger)}>
                  Every project is executed with strict adherence to safety protocols and environmental
                  standards, ensuring long-term value for our clients and the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MISSION, VISION & CORE VALUES ========== */}
      <section
        id="mission-vision"
        className="relative px-6 md:px-10 py-16 md:py-20 bg-transparent overflow-hidden"
      >
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Heading */}
          <div ref={mvHeadingRef} className={`text-center transition-all duration-1000 ${mvHeadingAnim}`}>
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="h-px w-16 bg-green-300 dark:bg-green-600"></div>
              <FaInfinity className="text-gray-600 dark:text-gray-400 text-2xl" />
              <div className="h-px w-16 bg-blue-300 dark:bg-blue-600"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto text-lg">
              Guided by purpose, driven by excellence, and grounded in values that define how the
              company serves clients, communities, and partners.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-20">
            {/* Mission */}
            <div ref={missionRef} className={`transition-all duration-1000 ${missionAnim}`}>
              <div style={fadeUpStyle(missionVisible, 0)} className="relative">
                <div className="absolute -top-8 -left-4 text-8xl font-black text-green-100 dark:text-green-900/30 select-none z-0">
                  M
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <FaBolt className="text-green-600 dark:text-green-400 text-2xl" />
                    <h4 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mission</h4>
                    <div className="flex-1 h-px bg-green-300 dark:bg-green-600"></div>
                  </div>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed pl-4 border-l-4 border-green-400 dark:border-green-600">
                    <p>
                      “We are a responsible land development company that provides high-quality backfill materials for land development projects and other infrastructures, including but not limited to sub-base materials like aggregates, mixed soil, and boulders. We support sustainable land development by adhering to the existing environmental regulations of the Philippines. We provide jobs for fellow Filipinos, which significantly contributes to boosting our country's economy. We are also keen to deliver excellent value to our partner communities, investors, employees, and other stakeholders.”
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div ref={visionRef} className={`transition-all duration-1000 delay-200 ${visionAnim}`}>
              <div style={fadeUpStyle(visionVisible, 0)} className="relative">
                <div className="absolute -top-8 -right-4 text-8xl font-black text-blue-100 dark:text-blue-900/30 select-none z-0">
                  V
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 justify-end">
                    <div className="flex-1 h-px bg-blue-300 dark:bg-blue-600"></div>
                    <h4 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Vision</h4>
                    <FaEye className="text-blue-600 dark:text-blue-400 text-2xl" />
                  </div>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed pr-4 border-r-4 border-blue-400 dark:border-blue-600 text-right">
                    <p>
                      “Our vision is to be a highly respected, world-class natural resource land development company committed to adhering to international standards in land development operations and environmental conservation, sustainable projects that cover converting land development sites into other useful and economic projects in the future, thus converting land development projects to future commercial and housing projects.”ㅤ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div ref={valuesRef} className={`transition-all duration-1000 ${valuesAnim}`}>
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px w-16 bg-green-300 dark:bg-green-600"></div>
              <FaInfinity className="text-green-600 dark:text-green-400 text-2xl" />
              <h4 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Core Values</h4>
              <div className="flex-1 h-px bg-blue-300 dark:bg-blue-600"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {/* Quality */}
              <div style={fadeUpStyle(valuesVisible, 0 * ANIM_CONFIG.staggerBase)} className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                  <FaCheckCircle className="w-7 h-7" />
                </div>
                <h5 className="font-semibold text-xl mb-2 text-gray-900 dark:text-gray-100">Quality</h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  We ensure projects are of high quality and align with local standards to remain
                  competitive in national and local markets.
                </p>
              </div>

              {/* Safety */}
              <div style={fadeUpStyle(valuesVisible, 1 * ANIM_CONFIG.staggerBase)} className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                  <FaShieldAlt className="w-7 h-7" />
                </div>
                <h5 className="font-semibold text-xl mb-2 text-gray-900 dark:text-gray-100">Safety</h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  We ensures safety at work site, safety of projects and safety of personnel and thus we ensure safety practices which is the pinnacle, before and after execution of projects.
                </p>
              </div>

              {/* Integrity */}
              <div style={fadeUpStyle(valuesVisible, 2 * ANIM_CONFIG.staggerBase)} className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                  <FaBalanceScale className="w-7 h-7" />
                </div>
                <h5 className="font-semibold text-xl mb-2 text-gray-900 dark:text-gray-100">Integrity</h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  We ensure compliance with existing laws covering the construction industry, reliable workforce and our timely delivery of projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== LEADERSHIP & TEAM ========== */}
      <section
        id="leadership"
        ref={leadershipRef}
        className={`relative px-6 md:px-10 py-16 md:py-20 bg-transparent transition-all duration-1000 ${leadershipAnim} overflow-hidden`}
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Team</h2>
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="h-px w-16 bg-green-300 dark:bg-green-600"></div>
              <FaInfinity className="text-gray-600 dark:text-gray-400 text-2xl" />
              <div className="h-px w-16 bg-blue-300 dark:bg-blue-600"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg">
              Meet the people behind Cliberduche. Founded in 2018 by <strong>Rolando Climaco</strong>,
              our leadership combines decades of construction experience with a deep commitment to
              integrity and sustainable development. Today, together with his family and a dedicated
              team of professionals, we continue to build lasting partnerships—one project at a time.
            </p>
          </div>

          {/* ===== CHROMA GRID with brief ===== */}
          <ChromaGrid items={teamDataForChroma} />

          {/* Subtle cue to next section */}
          <div className="flex justify-center mt-12">
            <a
              href="#insights"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-300 group"
            >
              <span className="text-sm uppercase tracking-wider">Discover Our Work</span>
              <FaArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </section>

      {/* ========== INSIGHTS & PORTFOLIO ========== */}
      <section
        id="insights"
        className="relative px-6 md:px-10 py-16 md:py-20 bg-transparent overflow-hidden"
      >
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Insights heading */}
          <div
            ref={insightsRef}
            className={`text-center mb-8 transition-all duration-1000 ${insightsAnim}`}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Insights</h3>
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="h-px w-16 bg-green-300 dark:bg-green-600"></div>
              <FaInfinity className="text-gray-600 dark:text-gray-400 text-2xl" />
              <div className="h-px w-16 bg-blue-300 dark:bg-blue-600"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg">
              Drawing from years of experience in land development and construction, our insights
              showcase the practical knowledge, sustainable practices, and innovative approaches
              that guide every project. We share lessons learned and strategies that help
              communities, clients, and partners make informed decisions.
            </p>
          </div>

          {/* Portfolio card */}
          <div
            ref={portfolioRef}
            className={`transition-all duration-1000 ${portfolioAnim}`}
          >
            <PortfolioHero
              imageUrl="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
              title="Discover Our Work"
              description="Explore CLIBERDUCHE CORPORATION’s journey—from our foundation in 2018 to our current projects. Learn about our sustainable land development practices, community impact, and how we deliver high-quality materials and construction services across CALABARZON."
              ctaUrl="https://cliberduche-portfolio.vercel.app/"
            />
          </div>
        </div>
      </section>
    </>
  );
}