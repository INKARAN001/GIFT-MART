import { useState, useEffect } from 'react';
import '../styles/animated-clock.css';

export default function AnimatedClock({ logoSrc = '/logo.png' }) {
  const letters = ['𝕀', 'N', 'T', '-', 'G', 'I', 'F', 'T', 'M', 'A', 'R', '🆃'];
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showLogo, setShowLogo] = useState(false);
  const [shownLetters, setShownLetters] = useState(new Set());

  useEffect(() => {
    let currentIndex = 0;
    const shown = new Set();

    const interval = setInterval(() => {
      if (currentIndex >= 12) {
        clearInterval(interval);
        setShowLogo(true);
        setActiveIndex(-1); // Reset active index so letters stop highlighting
        return;
      }

      setActiveIndex(currentIndex);
      shown.add(currentIndex);
      setShownLetters(new Set(shown));
      currentIndex++;
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animated-clock-container">
      <div className="clock" id="clock">
        {letters.map((letter, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = 200 + 140 * Math.cos(angle);
          const y = 200 + 140 * Math.sin(angle);

          return (
            <div
              key={i}
              className={`letter-position ${shownLetters.has(i) ? 'shown' : ''} ${
                activeIndex === i ? 'active' : ''
              }`}
              style={{
                left: x - 30 + 'px',
                top: y - 30 + 'px'
              }}
            >
              {letter}
            </div>
          );
        })}
        {/* Logo centered in the clock */}
        <div className="clock-logo-wrap">
          <img
            src={logoSrc}
            alt="Gift Mart"
            className={`clock-logo ${showLogo ? 'show' : ''}`}
          />
        </div>
      </div>
    </div>
  );
}
