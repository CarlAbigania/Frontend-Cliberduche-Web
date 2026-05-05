// Import all images
import mdi_2019_1 from "/projects/mdi_2019/2019_img_1.png";
import mdi_2019_2 from "/projects/mdi_2019/2019_img_2.png";
import mdi_2019_3 from "/projects/mdi_2019/2019_img_3.png";
import mdi_2019_4 from "/projects/mdi_2019/2019_img_4.png";
import mdi_2019_5 from "/projects/mdi_2019/2019_img_5.png";

import mdi_2024_1 from "/projects/mdi_2024/2024_img_1.png";
import mdi_2024_2 from "/projects/mdi_2024/2024_img_2.png";
import mdi_2024_3 from "/projects/mdi_2024/2024_img_3.png";
import mdi_2024_4 from "/projects/mdi_2024/2024_img_4.png";

import silang_img_1 from "/projects/silangCavite_2021/2021_img_1.png";
import silang_img_2 from "/projects/silangCavite_2021/2021_img_2.png";
import silang_img_3 from "/projects/silangCavite_2021/2021_img_3.png";
import silang_img_4 from "/projects/silangCavite_2021/2021_img_4.png";

import cbd_img_1 from "/projects/cbdBuilding_2019/cbd_2019_img_1.png";
import cbd_img_2 from "/projects/cbdBuilding_2019/cbd_2019_img_2.png";
import cbd_img_3 from "/projects/cbdBuilding_2019/cbd_2019_img_3.png";
import cbd_img_4 from "/projects/cbdBuilding_2019/cbd_2019_img_4.png";
import cbd_img_5 from "/projects/cbdBuilding_2019/cbd_2019_img_5.png";
import cbd_img_6 from "/projects/cbdBuilding_2019/cbd_2019_img_6.png";

import mdi_2025_1 from "/projects/mdi_2025/2025_img_1.png";
import mdi_2025_2 from "/projects/mdi_2025/2025_img_2.png";
import mdi_2025_3 from "/projects/mdi_2025/2025_img_3.png";
import mdi_2025_4 from "/projects/mdi_2025/2025_img_4.png";
import mdi_2025_5 from "/projects/mdi_2025/2025_img_5.png";
import mdi_2025_6 from "/projects/mdi_2025/2025_img_6.png";
import mdi_2025_7 from "/projects/mdi_2025/2025_img_7.png";
import mdi_2025_8 from "/projects/mdi_2025/2025_img_8.png";
import mdi_2025_9 from "/projects/mdi_2025/2025_img_9.png";
import mdi_2025_10 from "/projects/mdi_2025/2025_img_10.png";
import mdi_2025_11 from "/projects/mdi_2025/2025_img_11.png";
import mdi_2025_12 from "/projects/mdi_2025/2025_img_12.png";

import mdi_ongoing_1 from "/projects/mdi_ongoing/ongoing_img_1.png";
import mdi_ongoing_2 from "/projects/mdi_ongoing/ongoing_img_2.png";
import mdi_ongoing_3 from "/projects/mdi_ongoing/ongoing_img_3.png";
import mdi_ongoing_4 from "/projects/mdi_ongoing/ongoing_img_4.png";
import mdi_ongoing_5 from "/projects/mdi_ongoing/ongoing_img_5.png";

import northport_ongoing_1 from "/projects/northport_ongoing/northport_img_1.png";
import northport_ongoing_2 from "/projects/northport_ongoing/northport_img_2.png";
import northport_ongoing_3 from "/projects/northport_ongoing/northport_img_3.png";
import northport_ongoing_4 from "/projects/northport_ongoing/northport_img_4.png";
import northport_ongoing_5 from "/projects/northport_ongoing/northport_img_5.jpg";

import tanza_img_1 from "/projects/tanzaCavite_ongoing/tanza_img_1.png";
import tanza_img_2 from "/projects/tanzaCavite_ongoing/tanza_img_2.png";
import tanza_img_3 from "/projects/tanzaCavite_ongoing/tanza_img_3.png";
import tanza_img_4 from "/projects/tanzaCavite_ongoing/tanza_img_4.png";
import tanza_img_5 from "/projects/tanzaCavite_ongoing/tanza_img_5.png";
import tanza_img_6 from "/projects/tanzaCavite_ongoing/tanza_img_6.png";

import mdi_logo from "/projects/partnersLogo/mdi_logo.png";
import northport_logo from "/projects/partnersLogo/northport_logo.png";
import peakland_logo from "/projects/partnersLogo/peakland_logo.png";
import zuelligPharma_logo from "/projects/partnersLogo/zuelligPharma_logo.png";

// Projects data
export const projects = [
    {
        id: "mdi2019",
        title: "MDI PROJECT 2019",
        partners: ["MDI", "Zuellig Pharma"],
        partnerLogos: [mdi_logo, zuelligPharma_logo],
        description: "Site works and land development.",
        images: [mdi_2019_1, mdi_2019_2, mdi_2019_3, mdi_2019_4, mdi_2019_5],
        year: 2019,
        category: "land-development"
    },
    {
        id: "mdi2024",
        title: "MDI - MERCATOR HOLDINGS PROJECT 2024",
        partners: ["MDI", "Zuellig Pharma"],
        description: "Clearing, grubbing, temporary fence removal and leveling.",
        images: [mdi_2024_1, mdi_2024_2, mdi_2024_3, mdi_2024_4],
        year: 2024,
        partnerLogos: [mdi_logo, zuelligPharma_logo],
        category: "site-preparation"
    },
    {
        id: "silang2021",
        title: "SILANG, CAVITE PROJECT 2021",
        partners: [],
        area: "18.3 hectares",
        description: "Leveling, compaction, drainage, road network, riprap and bridge works.",
        images: [silang_img_1, silang_img_2, silang_img_3, silang_img_4],
        year: 2021,
        category: "infrastructure"
    },
    {
        id: "cbd2019",
        title: "CBD BUILDING PROJECT 2019",
        description: "3-storey commercial building.",
        images: [cbd_img_1, cbd_img_2, cbd_img_3, cbd_img_4, cbd_img_5, cbd_img_6],
        year: 2019,
        category: "construction"
    },
    {
        id: "mdi2025",
        title: "MDI - MERCATOR HOLDINGS PROJECT 2025",
        partners: ["MDI", "Zuellig Pharma"],
        description: "Embankment, gabion walls, perimeter fence & gate, retaining wall, pavement, electrical lights and landscaping.",
        images: [mdi_2025_1, mdi_2025_2, mdi_2025_3, mdi_2025_4, mdi_2025_5, mdi_2025_6, mdi_2025_7, mdi_2025_8, mdi_2025_9, mdi_2025_10, mdi_2025_11, mdi_2025_12],
        year: 2025,
        partnerLogos: [mdi_logo, zuelligPharma_logo],
        category: "comprehensive"
    },
    {
        id: "ongoing",
        title: "MDI Ongoing Works",
        description: "Embankment, diversion road, retaining walls, drainage and pavement.",
        images: [mdi_ongoing_1, mdi_ongoing_2, mdi_ongoing_3, mdi_ongoing_4, mdi_ongoing_5],
        partnerLogos: [mdi_logo, zuelligPharma_logo],
        year: 2026,
        category: "ongoing"
    },
    {
        id: "northport",
        title: "PIER 2 NORTH HARBOUR (ONGOING)",
        partners: ["Northport"],
        description: "Reconstruction of bridge, pavement, lagoon, embankment, drainage, water & electrical works.",
        images: [northport_ongoing_1, northport_ongoing_2, northport_ongoing_3, northport_ongoing_4, northport_ongoing_5],
        partnerLogos: [northport_logo],
        year: 2026,
        category: "ongoing"
    },
    {
        id: "tanza",
        title: "WDV PHASE 4 TANZA, CAVITE (ONGOING)",
        partners: ["Peakland"],
        description: "Retaining wall & perimeter fence.",
        images: [tanza_img_1, tanza_img_2, tanza_img_3, tanza_img_4, tanza_img_5, tanza_img_6],
        partnerLogos: [peakland_logo],
        year: 2026,
        category: "ongoing"
    },
];

// Optional: You can also export helper functions if needed
export const getOngoingProjects = () => projects.filter(p => p.category === "ongoing");
export const getCompletedProjects = () => projects.filter(p => p.category !== "ongoing");
export const getFeaturedProject = () => projects.find(p => p.id === "mdi2025");