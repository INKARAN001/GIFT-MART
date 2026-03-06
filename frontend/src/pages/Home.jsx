import AnimatedClock from '../components/AnimatedClock';
import GiftCategories from '../components/GiftCategories';
import '../styles/home.css';

// Sprint 1 Home: hero video + categories gallery only (no product links)
export default function Home() {
  return (
    <>
      {/* Hero Section with Video Background and Clock */}
      <section className="hero-video-section">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/WhatsApp Video 2026-02-22 at 09.51.11.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-video-overlay"></div>

        {/* Animated Clock Overlay */}
        <div className="clock-overlay">
          <AnimatedClock logoSrc="/logo.png" />
        </div>
      </section>

      {/* Gift Categories Grid */}
      <GiftCategories />
    </>
  );
}
