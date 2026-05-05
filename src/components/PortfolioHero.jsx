import React from "react";
import MagneticButton from "./MagneticButton"; // adjust import path as needed

/**
 * PortfolioHero
 * - imageUrl: string (required)
 * - title, description, ctaUrl are optional with sensible defaults
 *
 * Notes:
 * - On small screens the image is shown full width under the content.
 * - On lg+ the CSS clipPath is applied to create the custom polygon shape.
 */
export default function PortfolioHero({
    imageUrl = "/path/to/default.jpg",
    title = "Be prepared with our property strategy guide.",
    description = `Be prepared with our free property guide. Our free guide walks you through the fundamentals of building a property portfolio, key considerations, and real examples to help everyday Australians approach property with confidence. Inside, you’ll see the framework we use so you can better understand how strategic property decisions are made.`,
    ctaUrl = "https://cliberduche-portfolio.vercel.app/",
}) {
    return (
        <section className="w-full">
            {/* Outer container */}
            <div className="max-w-7xl mx-auto md:px-6 py-6 md:py-12">
                <div className="relative bg-[#081c33] text-white rounded-2xl overflow-hidden shadow-lg">

                    {/* subtle green gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-transparent to-transparent pointer-events-none" />

                    <div className="relative grid grid-cols-1 lg:grid-cols-[3fr_2fr] min-h-[500px]">

                        {/* LEFT: content */}
                        <div className="p-6 md:p-8 lg:p-12 xl:p-16 flex items-center">
                            <div className="max-w-xl">

                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 md:mb-6">
                                    {title}
                                </h2>

                                <p className="text-gray-200 mb-6 md:mb-8 leading-relaxed text-sm sm:text-base">
                                    {description}
                                </p>

                                {/* Magnetic CTA button */}
                                <MagneticButton
                                    magnetStrength={2}
                                    padding={100}
                                    activeTransition="transform 0.2s ease-out"
                                    inactiveTransition="transform 0.4s ease-in-out"
                                    wrapperClassName="inline-block"
                                >
                                    <a
                                        href={ctaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 bg-white text-black px-6 py-4 rounded-sm font-semibold uppercase tracking-wide shadow hover:bg-green-500 hover:text-white transition-colors duration-200"
                                    >
                                        {/* link icon */}
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                            />
                                        </svg>

                                        <span>VIEW OUR PORTFOLIO</span>
                                    </a>
                                </MagneticButton>

                            </div>
                        </div>

                        {/* RIGHT: image area */}
                        <div className="relative w-full h-96 md:h-80 lg:h-auto lg:min-h-[500px]">

                            {/* Mobile image */}
                            <img
                                src={imageUrl}
                                alt=""
                                className="block lg:hidden w-full h-full object-cover"
                                aria-hidden="true"
                            />

                            {/* Desktop clipped image */}
                            <div className="hidden lg:block absolute inset-0 w-full h-full">
                                <img
                                    src={imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    style={{
                                        clipPath:
                                            "polygon(54% 0, 100% 0, 100% 30%, 75% 63%, 100% 100%, 39% 100%, 0 63%)",
                                    }}
                                />
                            </div>

                            {/* right spacer */}
                            <div className="absolute right-0 top-0 h-full w-12 pointer-events-none" />

                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}