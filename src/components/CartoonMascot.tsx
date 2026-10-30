/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, Heart, Zap } from 'lucide-react';

export type MascotMood = 'happy' | 'thinking' | 'celebrating' | 'warning' | 'curious';

interface CartoonMascotProps {
  mood?: MascotMood;
  speechText?: string;
  size?: 'sm' | 'md' | 'lg';
  showSpeech?: boolean;
}

export const CartoonMascot: React.FC<CartoonMascotProps> = ({
  mood = 'happy',
  speechText = "Hi! I'm Crafty, your friendly QA Robot! Let's generate awesome test cases!",
  size = 'md',
  showSpeech = true,
}) => {
  const [clicked, setClicked] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips = [
    "Tip: Strategy B (Structured) sets explicit rules so the AI doesn't guess!",
    "Notice REQ-005? Basic prompting will invent arbitrary numbers, but Structured flags it as an assumption!",
    "Few-Shot prompting gives 2 examples so the AI learns the exact style you want!",
    "Click 'Run 3-Way Comparison' to watch all three battle it out in real time!",
  ];

  const handleMascotClick = () => {
    setClicked(true);
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    setTimeout(() => setClicked(false), 500);
  };

  const currentSpeech = speechText || tips[currentTipIndex];

  // Scale based on size
  const scaleClass =
    size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-28 h-28' : 'w-20 h-20';

  return (
    <div className="relative inline-flex items-center gap-3 select-none">
      {/* Cartoon Robot Character */}
      <motion.div
        onClick={handleMascotClick}
        className={`relative ${scaleClass} cursor-pointer drop-shadow-md`}
        animate={
          clicked
            ? { scale: [1, 1.25, 0.95, 1], rotate: [0, -10, 10, 0] }
            : mood === 'thinking'
            ? { y: [0, -4, 0], rotate: [-2, 2, -2] }
            : mood === 'celebrating'
            ? { y: [0, -12, 0], scale: [1, 1.1, 1] }
            : { y: [0, -6, 0] }
        }
        transition={{
          duration: mood === 'thinking' ? 1.2 : mood === 'celebrating' ? 0.6 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full filter drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Antenna */}
          <line
            x1="60"
            y1="32"
            x2="60"
            y2="14"
            stroke="#7c3aed"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Antenna Bulb */}
          <circle
            cx="60"
            cy="11"
            r="8"
            fill={mood === 'warning' ? '#f59e0b' : mood === 'thinking' ? '#10b981' : '#a855f7'}
            stroke="#ffffff"
            strokeWidth="3"
            className={mood === 'thinking' ? 'animate-pulse' : ''}
          />

          {/* Ears / Head Bolts */}
          <rect x="18" y="48" width="8" height="18" rx="4" fill="#10b981" />
          <rect x="94" y="48" width="8" height="18" rx="4" fill="#10b981" />

          {/* Robot Head Outer */}
          <rect
            x="24"
            y="28"
            width="72"
            height="58"
            rx="18"
            fill="#ffffff"
            stroke="#7c3aed"
            strokeWidth="4.5"
          />

          {/* Screen Visor Face */}
          <rect
            x="32"
            y="36"
            width="56"
            height="42"
            rx="12"
            fill="#ede9fe"
            stroke="#8b5cf6"
            strokeWidth="2.5"
          />

          {/* Eyes */}
          {mood === 'celebrating' ? (
            /* Star eyes */
            <>
              <text x="40" y="58" fontSize="16" fill="#10b981" fontWeight="bold">★</text>
              <text x="64" y="58" fontSize="16" fill="#10b981" fontWeight="bold">★</text>
            </>
          ) : mood === 'thinking' ? (
            /* Spinning / Spiral thinking eyes */
            <>
              <circle cx="46" cy="54" r="5" fill="#7c3aed" />
              <circle cx="74" cy="54" r="5" fill="#7c3aed" />
              <circle cx="48" cy="52" r="2" fill="#ffffff" />
              <circle cx="76" cy="52" r="2" fill="#ffffff" />
            </>
          ) : mood === 'warning' ? (
            /* Wide alert eyes */
            <>
              <circle cx="46" cy="52" r="6" fill="#f59e0b" />
              <circle cx="74" cy="52" r="6" fill="#f59e0b" />
              <circle cx="47" cy="50" r="2.5" fill="#ffffff" />
              <circle cx="75" cy="50" r="2.5" fill="#ffffff" />
            </>
          ) : (
            /* Happy big round cartoon eyes */
            <>
              <circle cx="46" cy="53" r="5.5" fill="#059669" />
              <circle cx="74" cy="53" r="5.5" fill="#059669" />
              <circle cx="48" cy="51" r="2" fill="#ffffff" />
              <circle cx="76" cy="51" r="2" fill="#ffffff" />
            </>
          )}

          {/* Cheerful Mouth */}
          {mood === 'celebrating' || mood === 'happy' ? (
            <path
              d="M50 66 Q60 75 70 66"
              stroke="#7c3aed"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : mood === 'thinking' ? (
            <circle cx="60" cy="68" r="3" fill="#7c3aed" />
          ) : mood === 'warning' ? (
            <line x1="52" y1="68" x2="68" y2="68" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <path
              d="M52 66 Q60 72 68 66"
              stroke="#7c3aed"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Blush Cheeks */}
          <ellipse cx="38" cy="62" rx="3.5" ry="2" fill="#f43f5e" opacity="0.4" />
          <ellipse cx="82" cy="62" rx="3.5" ry="2" fill="#f43f5e" opacity="0.4" />

          {/* Body */}
          <path
            d="M38 86 L42 108 Q60 114 78 108 L82 86 Z"
            fill="#ffffff"
            stroke="#7c3aed"
            strokeWidth="4"
          />

          {/* Belly Badge: Emerald Green Heart/Lightning */}
          <rect x="52" y="93" width="16" height="12" rx="4" fill="#10b981" />
          <path d="M57 99 L61 95 L63 98 L65 95" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>

        {/* Small floating sparkles */}
        {mood === 'celebrating' && (
          <motion.div
            className="absolute -top-2 -right-2 text-emerald-500"
            animate={{ rotate: 360, scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 fill-emerald-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Cartoon Speech Bubble */}
      {showSpeech && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSpeech}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-slate-900 border-2 border-violet-200 dark:border-violet-800 rounded-2xl px-4 py-2.5 shadow-sm max-w-sm"
          >
            {/* Speech bubble pointer */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-violet-200 dark:border-r-violet-800" />
            <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-white dark:border-r-slate-900" />

            <div className="flex items-start gap-1.5 text-xs">
              <span className="font-semibold text-violet-700 dark:text-violet-300 shrink-0">Crafty:</span>
              <p className="text-slate-700 dark:text-slate-200 leading-snug">{currentSpeech}</p>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-right">
              Click me for more tips!
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
