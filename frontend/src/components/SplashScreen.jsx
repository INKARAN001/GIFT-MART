import { useState, useEffect, useRef } from 'react';
import AnimatedClock from './AnimatedClock';
import '../styles/splash.css';

// The phrase split into individual characters for the typewriter effect
const PHRASE = 'INT Gift Mart';

// Total time the splash is visible before fading out (ms)
const TOTAL_DURATION = 4200;
// Delay before the fade-out starts (after bar is full)
const FADEOUT_DELAY = 600;
// How long each letter takes to appear (staggered)
const LETTER_INTERVAL = 90; // ms between each letter reveal

export default function SplashScreen({ onDone }) {
    const [visibleCount, setVisibleCount] = useState(0);
    const [barWidth, setBarWidth] = useState(0);
    const [clockVisible, setClockVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const rafRef = useRef(null);

    const letters = Array.from(PHRASE); // preserves spaces as elements

    useEffect(() => {
        // ── 1. Letter typewriter ──────────────────────────
        let idx = 0;
        const letterTimer = setInterval(() => {
            idx++;
            setVisibleCount(idx);
            if (idx >= letters.length) clearInterval(letterTimer);
        }, LETTER_INTERVAL);

        // ── 2. Progress bar (runs for TOTAL_DURATION ms) ──
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
            setBarWidth(pct);
            if (pct < 100) {
                rafRef.current = requestAnimationFrame(tick);
            }
        }
        rafRef.current = requestAnimationFrame(tick);

        // ── 3. Clock appears shortly after letters finish ─
        const clockTimer = setTimeout(() => {
            setClockVisible(true);
        }, letters.length * LETTER_INTERVAL + 100);

        // ── 4. Fade-out then call onDone ─────────────────
        const exitTimer = setTimeout(() => {
            setExiting(true);
            setTimeout(onDone, 800); // wait for fade-out transition
        }, TOTAL_DURATION + FADEOUT_DELAY);

        return () => {
            clearInterval(letterTimer);
            cancelAnimationFrame(rafRef.current);
            clearTimeout(clockTimer);
            clearTimeout(exitTimer);
        };
    }, [onDone]);

    return (
        <div className={`splash-screen${exiting ? ' exiting' : ''}`}>

            {/* ── Phrase with per-letter reveal ── */}
            <div className="splash-phrase" aria-label={PHRASE}>
                {letters.map((ch, i) => (
                    <span
                        key={i}
                        className={`splash-letter${ch === ' ' ? ' space' : ''}${i < visibleCount ? ' visible' : ''}`}
                    >
                        {ch === ' ' ? '\u00A0' : ch}
                    </span>
                ))}
            </div>

            {/* ── Loading bar ── */}
            <div className="splash-bar-track">
                <div
                    className="splash-bar-fill"
                    style={{ width: `${barWidth}%` }}
                />
            </div>

            {/* ── Animated clock (fades in after letters) ── */}
            <div className={`splash-clock-wrap${clockVisible ? ' visible' : ''}`}>
                <AnimatedClock />
            </div>

        </div>
    );
}
