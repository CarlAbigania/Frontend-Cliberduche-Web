import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import MagneticButton from "../../components/MagneticButton";
import railen1 from "/notFound/railen1.png";
import railen2 from "/notFound/railen2.png";
import edsen1 from "/notFound/edsen1.png";
import edsen2 from "/notFound/edsen2.png";
import luis1 from "/notFound/luis1.png";
import luis2 from "/notFound/luis2.png";
import abi1 from "/notFound/abi1.png";
import abi2 from "/notFound/abi2.png";
import elwin1 from "/notFound/elwin1.png";
import elwin2 from "/notFound/elwin2.png";

// --- CONFIGURABLE DELAYS (in milliseconds) ---
const IDLE_TIMEOUT_MS = 60000;        // Time of inactivity before idle messages start (1 minute)
const IDLE_MESSAGE_INTERVAL_MS = 15000; // Time between idle messages (adjust to your liking, e.g., 30000 for 30 seconds)
// --------------------------------------------

// Click messages (stable reference)
const clickMessages = [
    "Ouch! Stop clicking!",
    "Why do you keep doing that?",
    "You're only making it worse!",
    "I warned you!",
    "Seriously, stop!",
    "edsen says stop clicking!",
    "luis is crying!",
    "railen is angry!",
    "abi is scared!",
    "elwin is confused!",
    "You monster!",
    "Please, no more clicks!",
    "Every click fuels the chaos!",
    "You're not helping!",
    "The images are getting stronger!",
    "Stop! Please!",
    "Okay, that's enough!",
    "I'm begging you!",
    "Nooooo!",
    "Why?!"
];

// Idle messages (stable reference)
const idleMessages = [
    "The images are taking over...",
    "See what you've done?",
    "They're multiplying!",
    "Help me...",
    "It's all your fault.",
    "The glitch is spreading.",
    "You could have stopped, but you didn't.",
    "Now they're everywhere.",
    "edsen, luis, railen, abi, elwin are lost.",
    "The chaos is endless.",
    "This is your doing.",
    "They won't stop.",
    "Neither will I.",
    "Tick tock...",
    "Still clicking? No? Good.",
    "But it's too late.",
    "The images have won.",
    "Embrace the madness.",
    "There's no escape.",
    "Just kidding... or am I?"
];

export default function NotFound() {
    const canvasRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    const [easterEggActive, setEasterEggActive] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [activeImages, setActiveImages] = useState([]);
    const [idleMode, setIdleMode] = useState(false);
    const clickCountRef = useRef(0);
    const sequenceStartedRef = useRef(false);
    const lastClickTimeRef = useRef(0);
    const timeoutRef = useRef(null);
    const clickMessageIndexRef = useRef(0);
    const idleMessageIndexRef = useRef(0);

    const allImages = [
        railen1, railen2,
        edsen1, edsen2,
        luis1, luis2,
        abi1, abi2,
        elwin1, elwin2
    ];

    const personImages = {
        edsen: [edsen1, edsen2],
        luis: [luis1, luis2],
        railen: [railen1, railen2],
        abi: [abi1, abi2],
        elwin: [elwin1, elwin2]
    };

    // List of all names for multi-name detection
    const allNames = ["edsen", "luis", "railen", "abi", "elwin"];

    // When dialogMessage changes, update which images should appear
    useEffect(() => {
        if (!easterEggActive) return;

        const lowerMsg = dialogMessage.toLowerCase();

        // Check if the message contains ALL five names
        const containsAllNames = allNames.every(name => lowerMsg.includes(name));

        if (containsAllNames) {
            // If all names are mentioned, show all images
            setActiveImages(allImages);
        } else {
            // Otherwise, show only the first matched person's images
            let matchedPerson = null;
            for (const person of Object.keys(personImages)) {
                if (lowerMsg.includes(person)) {
                    matchedPerson = person;
                    break;
                }
            }
            if (matchedPerson) {
                setActiveImages(personImages[matchedPerson]);
            } else {
                setActiveImages(allImages); // fallback to all images if no name matched
            }
        }
    }, [dialogMessage, easterEggActive]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Effect to check for idle (only runs when chaos is active and not already in idle mode)
    useEffect(() => {
        if (!easterEggActive || idleMode) return;

        const checkIdle = () => {
            if (Date.now() - lastClickTimeRef.current > IDLE_TIMEOUT_MS) {
                setIdleMode(true);
            }
        };

        const interval = setInterval(checkIdle, 1000);
        return () => clearInterval(interval);
    }, [easterEggActive, idleMode]);

    // Effect to cycle idle messages (only runs when in idle mode)
    useEffect(() => {
        if (!easterEggActive || !idleMode) return;

        // Set first idle message immediately
        setDialogMessage(idleMessages[idleMessageIndexRef.current % idleMessages.length]);
        idleMessageIndexRef.current++;

        const interval = setInterval(() => {
            setDialogMessage(idleMessages[idleMessageIndexRef.current % idleMessages.length]);
            idleMessageIndexRef.current++;
        }, IDLE_MESSAGE_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [easterEggActive, idleMode, idleMessages]);

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        if (clickX >= 0 && clickX <= canvas.width && clickY >= 0 && clickY <= canvas.height) {
            clickCountRef.current += 1;

            // 3rd click: show persistent warning
            if (clickCountRef.current === 3) {
                setShowDialog(true);
                setDialogMessage("Don’t click it anymore!");
            }

            // 4th click: start the chaos sequence (only once)
            if (clickCountRef.current >= 4 && !sequenceStartedRef.current) {
                sequenceStartedRef.current = true;
                lastClickTimeRef.current = Date.now();

                setDialogMessage("Oh Nooooo!");

                timeoutRef.current = setTimeout(() => {
                    setEasterEggActive(true);
                    setDialogMessage("Please make it stopp");

                    setTimeout(() => {
                        setDialogMessage("edsen, luis, railen, abi, elwin stopp!!!!");
                        lastClickTimeRef.current = Date.now();
                    }, 2000);
                }, 1000);
            }

            // If chaos is already active, handle click-specific messages
            if (easterEggActive) {
                lastClickTimeRef.current = Date.now();

                if (idleMode) {
                    setIdleMode(false);
                }

                setDialogMessage(clickMessages[clickMessageIndexRef.current % clickMessages.length]);
                clickMessageIndexRef.current++;
            }
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const text = "404";
        const fontSize = 200;

        let offsets = [];
        let targetOffsets = [];

        const resize = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = 300;
        };
        resize();
        window.addEventListener("resize", resize);

        let flashObjects = [];

        const rebuildFlashObjects = () => {
            flashObjects = activeImages.map((img) => ({
                img,
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 50 + Math.random() * 50,
                alpha: 0,
                targetAlpha: 0,
                rotation: (Math.random() - 0.5) * Math.PI,
            }));
        };

        rebuildFlashObjects();

        const smoothing = 0.1;
        let animationFrameId;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const fuzz = hovered ? 40 : 15;
            const layers = hovered ? 12 : 6;

            if (offsets.length !== layers) {
                offsets = Array.from({ length: layers }, () => ({ x: 0, y: 0 }));
                targetOffsets = Array.from({ length: layers }, () => ({
                    x: (Math.random() - 0.5) * fuzz,
                    y: (Math.random() - 0.5) * fuzz,
                }));
            }

            const x = canvas.width / 2;
            const y = canvas.height / 2;

            for (let i = 0; i < layers; i++) {
                offsets[i].x += (targetOffsets[i].x - offsets[i].x) * smoothing;
                offsets[i].y += (targetOffsets[i].y - offsets[i].y) * smoothing;

                if (Math.abs(offsets[i].x - targetOffsets[i].x) < 0.5)
                    targetOffsets[i].x = (Math.random() - 0.5) * fuzz;
                if (Math.abs(offsets[i].y - targetOffsets[i].y) < 0.5)
                    targetOffsets[i].y = (Math.random() - 0.5) * fuzz;

                ctx.fillStyle = i % 2 === 0 ? "#0b2545" : "#ff0000";
                ctx.font = `900 ${fontSize}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(text, x + offsets[i].x, y + offsets[i].y);
            }

            if (easterEggActive) {
                flashObjects.forEach((obj) => {
                    if (Math.random() < 0.1) {
                        obj.targetAlpha = obj.targetAlpha === 1 ? 0 : 1;
                        obj.x = Math.random() * canvas.width;
                        obj.y = Math.random() * canvas.height;
                        obj.rotation = (Math.random() - 0.5) * Math.PI;
                    }

                    obj.alpha += (obj.targetAlpha - obj.alpha) * 0.2;

                    if (obj.alpha > 0.01) {
                        const imageObj = new Image();
                        imageObj.src = obj.img;

                        ctx.save();
                        ctx.globalAlpha = obj.alpha;
                        ctx.translate(obj.x + obj.size / 2, obj.y + obj.size / 2);
                        ctx.rotate(obj.rotation);
                        ctx.drawImage(imageObj, -obj.size / 2, -obj.size / 2, obj.size, obj.size);
                        ctx.restore();
                    }
                });
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resize);
        };
    }, [hovered, easterEggActive, activeImages]);

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-transparent px-4 overflow-x-hidden">

            <canvas
                ref={canvasRef}
                className="mb-6 cursor-pointer"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={handleCanvasClick}
            />

            <p className="mt-4 text-gray-500 text-xl text-center max-w-xl">
                The page you’re looking for doesn’t exist.
            </p>

            <MagneticButton
                wrapperClassName="mt-8 inline-block"
                innerClassName="px-8 py-4 bg-[#0b2545] text-white rounded-lg cursor-pointer select-none"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <Link to="/">Go Back Home</Link>
            </MagneticButton>

            {showDialog && (
                <div className="absolute top-20 flex items-center gap-2 bg-black text-red-500 px-6 py-3 rounded-lg font-bold text-lg animate-shake opacity-90">
                    <FiAlertTriangle size={24} />
                    {dialogMessage}
                </div>
            )}

            {clickCountRef.current < 3 && (
                <p className="mt-2 text-sm text-gray-400">

                </p>
            )}

            <style>{`
        @keyframes shake {
          0% { transform: translate(0,0) rotate(0deg); }
          20% { transform: translate(-5px,5px) rotate(-5deg); }
          40% { transform: translate(5px,-5px) rotate(5deg); }
          60% { transform: translate(-5px,5px) rotate(-5deg); }
          80% { transform: translate(5px,-5px) rotate(5deg); }
          100% { transform: translate(0,0) rotate(0deg); }
        }
        .animate-shake {
          animation: shake 0.5s infinite;
        }
      `}</style>
        </div>
    );
}