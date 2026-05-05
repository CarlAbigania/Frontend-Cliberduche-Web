import React, { useState, useEffect, useRef } from "react";
import { FaStar } from "react-icons/fa";

const MicroAnimationCaptcha = ({ onSuccess }) => {
    const SHAPES = [
        { type: 'circle', icon: null },
        { type: 'square', icon: null },
        { type: 'star', icon: FaStar },
        { type: 'triangle', icon: null },
    ];

    const ANIMATIONS = ['bounce', 'spin', 'wiggle', 'pulse'];

    const [animating, setAnimating] = useState(Array(SHAPES.length).fill(true));
    const [correctIndex, setCorrectIndex] = useState(null);
    const [status, setStatus] = useState('waiting');
    const timeoutRefs = useRef([]);

    const clearTimeouts = () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
    };

    const startTimeouts = () => {
        clearTimeouts();
        setAnimating(Array(SHAPES.length).fill(true));
        setCorrectIndex(null);
        setStatus('waiting');

        const delays = SHAPES.map(() => Math.random() * 2000 + 500);
        const newTimeouts = [];

        SHAPES.forEach((_, i) => {
            const timeoutId = setTimeout(() => {
                setAnimating(prev => {
                    const next = [...prev];
                    next[i] = false;
                    return next;
                });
                setCorrectIndex(prev => {
                    if (prev === null) {
                        timeoutRefs.current.forEach((id, idx) => {
                            if (idx !== i) clearTimeout(id);
                        });
                        return i;
                    }
                    return prev;
                });
            }, delays[i]);
            newTimeouts.push(timeoutId);
        });
        timeoutRefs.current = newTimeouts;
    };

    useEffect(() => {
        startTimeouts();
        return clearTimeouts;
    }, []);

    const handleClick = (index) => {
        if (status === 'success') return;

        if (correctIndex === null) {
            setStatus('fail');
            setTimeout(() => startTimeouts(), 800);
            return;
        }

        if (index === correctIndex && !animating[index]) {
            setStatus('success');
            onSuccess();
        } else {
            setStatus('fail');
            setTimeout(() => startTimeouts(), 800);
        }
    };

    const getShapeClass = (index) => {
        if (!animating[index]) return 'captcha-shape stopped';
        return `captcha-shape animating ${ANIMATIONS[index]}`;
    };

    const renderShape = (shape, index) => {
        const commonProps = {
            className: getShapeClass(index),
            onClick: () => handleClick(index),
        };

        if (shape.icon) {
            const Icon = shape.icon;
            return <Icon {...commonProps} />;
        }

        switch (shape.type) {
            case 'circle':
                return <div {...commonProps} />;
            case 'square':
                return <div {...commonProps} />;
            case 'triangle':
                return <div {...commonProps} className={`${commonProps.className} triangle`} />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="captcha-shapes">
                {SHAPES.map((shape, i) => (
                    <div key={i} className="shape-wrapper">
                        {renderShape(shape, i)}
                    </div>
                ))}
            </div>
            {status === 'fail' && (
                <div className="captcha-feedback">✕ Try again</div>
            )}
            {status === 'success' && (
                <div className="captcha-feedback success">✓ Verified</div>
            )}
            <style>{`
        .captcha-shapes {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
          margin: 1rem 0;
        }
        .shape-wrapper {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .captcha-shape {
          width: 40px;
          height: 40px;
          background-color: #2d6a4f;
          transition: background-color 0.2s;
        }
        .captcha-shape.stopped {
          background-color: #a7c4b5;
          cursor: pointer;
        }
        .shape-wrapper .captcha-shape:not(svg):not(.triangle) {
          border-radius: 50%;
        }
        .shape-wrapper .captcha-shape.triangle {
          width: 0;
          height: 0;
          background: transparent;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 35px solid #2d6a4f;
        }
        .shape-wrapper .captcha-shape.triangle.stopped {
          border-bottom-color: #a7c4b5;
        }
        .shape-wrapper svg {
          width: 40px;
          height: 40px;
          color: #2d6a4f;
          fill: currentColor;
        }
        .shape-wrapper svg.stopped {
          color: #a7c4b5;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .captcha-shape.animating.bounce {
          animation: bounce 0.8s infinite ease-in-out;
        }
        .captcha-shape.animating.spin {
          animation: spin 1.2s infinite linear;
        }
        .captcha-shape.animating.wiggle {
          animation: wiggle 0.3s infinite ease-in-out;
        }
        .captcha-shape.animating.pulse {
          animation: pulse 0.9s infinite ease-in-out;
        }

        .captcha-feedback {
          margin-top: 0.75rem;
          font-size: 0.85rem;
          color: #b91c1c;
          font-weight: 500;
          text-align: center;
        }
        .captcha-feedback.success {
          color: #2d6a4f;
        }
      `}</style>
        </>
    );
};

export default MicroAnimationCaptcha;