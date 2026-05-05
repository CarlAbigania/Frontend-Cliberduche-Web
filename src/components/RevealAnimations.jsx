import React from 'react';

/**
 * BlockReveal – covers an area with a grid of white/black cells that fade out sequentially.
 * @param {Object} props
 * @param {boolean} props.active - When true, cells fade out (revealing content behind).
 * @param {number} props.rows - Number of rows in the grid (default 8).
 * @param {number} props.cols - Number of columns in the grid (default 12).
 */
export const BlockReveal = ({ active, rows = 8, cols = 12 }) => {
    return (
        <div
            className="absolute inset-0 grid pointer-events-none"
            style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
        >
            {Array.from({ length: rows * cols }).map((_, i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                // Delay increases with row (top to bottom) and slightly with column
                const delay = active ? `${row * 0.1 + col * 0.02}s` : '0s';
                return (
                    <div
                        key={i}
                        className="w-full h-full bg-white dark:bg-gray-900 transition-opacity duration-700 ease-out"
                        style={{
                            opacity: active ? 0 : 1,
                            transitionDelay: delay,
                        }}
                    />
                );
            })}
        </div>
    );
};

/**
 * LetterReveal – animates each letter of the given lines from top to bottom.
 * (No changes needed – text colors are controlled by parent components.)
 */
export const LetterReveal = ({ active, lines, letterDelay = 0.05 }) => {
    // Flatten all letters across lines and words with their positions
    const letters = [];
    lines.forEach((line, lineIdx) => {
        const words = line.split(' ');
        words.forEach((word, wordIdx) => {
            // Add each character of the word
            for (let i = 0; i < word.length; i++) {
                letters.push({
                    char: word[i],
                    line: lineIdx,
                    word: wordIdx,
                    pos: letters.length, // global position
                });
            }
            // Add a space after each word except the last in line
            if (wordIdx < words.length - 1) {
                letters.push({
                    char: ' ',
                    line: lineIdx,
                    word: wordIdx,
                    pos: letters.length,
                    isSpace: true,
                });
            }
        });
        // No extra space at end of line
    });

    return (
        <div className="inline-block">
            {lines.map((line, lineIdx) => (
                <div key={lineIdx} className="whitespace-nowrap">
                    {line.split(' ').map((word, wordIdx) => (
                        <React.Fragment key={wordIdx}>
                            {word.split('').map((char, charIdx) => {
                                // Find this character's global index
                                const globalIndex = letters.findIndex(
                                    (l) =>
                                        l.line === lineIdx &&
                                        l.word === wordIdx &&
                                        l.char === char &&
                                        !l.isSpace
                                );
                                const delay = active ? `${globalIndex * letterDelay}s` : '0s';
                                return (
                                    <span
                                        key={charIdx}
                                        className="inline-block transition-opacity duration-700 ease-out"
                                        style={{
                                            opacity: active ? 1 : 0,
                                            transitionDelay: delay,
                                        }}
                                    >
                                        {char}
                                    </span>
                                );
                            })}
                            {/* Add a space after each word except the last */}
                            {wordIdx < line.split(' ').length - 1 && (
                                <span className="whitespace-pre"> </span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            ))}
        </div>
    );
};