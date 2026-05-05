import React from "react";

export default function Map() {
    const lat = 14.2467045;
    const lng = 121.1306403;

    const src = `https://www.google.com/maps?q=${lat},${lng}&z=18&output=embed`;

    return (
        <div className="w-full rounded-lg overflow-hidden border border-white/20 shadow-lg">
            <iframe
                title="Company location map"
                src={src}
                className="w-full h-64 md:h-72 lg:h-80 border-0"
                loading="lazy"
                allowFullScreen
            />
        </div>
    );
}
