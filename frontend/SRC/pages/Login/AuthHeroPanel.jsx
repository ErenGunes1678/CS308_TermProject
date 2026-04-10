import { useEffect, useRef } from "react";
import "./AuthHeroPanel.css";

const BUBBLE_MOTION_CONFIG = [
  {
    className: "bubble-1",
    driftX: 34,
    driftY: 24,
    scale: 0.12,
    speed: 0.00072,
    parallaxX: 36,
    parallaxY: 28,
    rotate: 5,
    glowMin: 0.22,
    glowMax: 0.5,
    phase: 0.35,
  },
  {
    className: "bubble-2",
    driftX: 28,
    driftY: 34,
    scale: 0.1,
    speed: 0.00064,
    parallaxX: -30,
    parallaxY: 30,
    rotate: -7,
    glowMin: 0.18,
    glowMax: 0.42,
    phase: 1.2,
  },
  {
    className: "bubble-3",
    driftX: 18,
    driftY: 22,
    scale: 0.14,
    speed: 0.00092,
    parallaxX: 42,
    parallaxY: -28,
    rotate: 10,
    glowMin: 0.16,
    glowMax: 0.4,
    phase: 2.35,
  },
  {
    className: "bubble-4",
    driftX: 30,
    driftY: 26,
    scale: 0.11,
    speed: 0.00058,
    parallaxX: -26,
    parallaxY: -24,
    rotate: -6,
    glowMin: 0.2,
    glowMax: 0.46,
    phase: 3.4,
  },
  {
    className: "bubble-5",
    driftX: 22,
    driftY: 18,
    scale: 0.16,
    speed: 0.00102,
    parallaxX: 32,
    parallaxY: 24,
    rotate: 8,
    glowMin: 0.16,
    glowMax: 0.38,
    phase: 4.1,
  },
];

function AuthHeroPanel({ activeTestimonial }) {
  const leftPanelRef = useRef(null);
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerCurrentRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);

  function handleHeroPointerMove(event) {
    const heroPanel = leftPanelRef.current;

    if (!heroPanel) {
      return;
    }

    const bounds = heroPanel.getBoundingClientRect();
    const normalizedX = (((event.clientX - bounds.left) / bounds.width) - 0.5) * 2;
    const normalizedY = (((event.clientY - bounds.top) / bounds.height) - 0.5) * 2;

    pointerTargetRef.current = { x: normalizedX, y: normalizedY };
  }

  function handleHeroPointerLeave() {
    pointerTargetRef.current = { x: 0, y: 0 };
  }

  useEffect(() => {
    const heroPanel = leftPanelRef.current;

    if (!heroPanel) {
      return undefined;
    }

    const bubbles = BUBBLE_MOTION_CONFIG.map((config) => {
      const wrapperNode = heroPanel.querySelector(`.${config.className}`);
      const orbNode = wrapperNode?.querySelector(".bubble-orb");

      if (!wrapperNode || !orbNode) {
        return null;
      }

      return {
        ...config,
        wrapperNode,
        orbNode,
      };
    }).filter(Boolean);

    const animate = (time) => {
      pointerCurrentRef.current.x +=
        (pointerTargetRef.current.x - pointerCurrentRef.current.x) * 0.12;
      pointerCurrentRef.current.y +=
        (pointerTargetRef.current.y - pointerCurrentRef.current.y) * 0.12;

      bubbles.forEach((bubble) => {
        const t = time * bubble.speed;

        const idleX =
          Math.sin(t + bubble.phase) * bubble.driftX +
          Math.cos(t * 0.68 + bubble.phase) * bubble.driftX * 0.42;
        const idleY =
          Math.cos(t * 0.94 + bubble.phase) * bubble.driftY +
          Math.sin(t * 0.58 + bubble.phase) * bubble.driftY * 0.36;
        const wrapperRotation =
          Math.sin(t * 0.52 + bubble.phase) * bubble.rotate;

        const parallaxX = pointerCurrentRef.current.x * bubble.parallaxX;
        const parallaxY = pointerCurrentRef.current.y * bubble.parallaxY;
        const orbScale =
          1 + Math.sin(t * 1.28 + bubble.phase) * bubble.scale;
        const orbRotation =
          Math.cos(t * 0.76 + bubble.phase) * (bubble.rotate * 0.45);
        const glowValue =
          bubble.glowMin +
          ((Math.sin(t * 1.18 + bubble.phase) + 1) / 2) *
            (bubble.glowMax - bubble.glowMin);
        const opacity = 0.72 + ((Math.sin(t * 1.12 + bubble.phase) + 1) / 2) * 0.24;

        bubble.wrapperNode.style.transform = `translate3d(${idleX}px, ${idleY}px, 0) rotate(${wrapperRotation}deg)`;
        bubble.orbNode.style.transform = `translate3d(${parallaxX}px, ${parallaxY}px, 0) scale(${orbScale}) rotate(${orbRotation}deg)`;
        bubble.orbNode.style.opacity = String(opacity);
        bubble.orbNode.style.setProperty("--bubble-glow", glowValue.toFixed(3));
      });

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={leftPanelRef}
      className="login-hero-left"
      onPointerMove={handleHeroPointerMove}
      onPointerLeave={handleHeroPointerLeave}
    >
      <div className="bubble bubble-1">
        <div className="bubble-orb"></div>
      </div>
      <div className="bubble bubble-2">
        <div className="bubble-orb"></div>
      </div>
      <div className="bubble bubble-3">
        <div className="bubble-orb"></div>
      </div>
      <div className="bubble bubble-4">
        <div className="bubble-orb"></div>
      </div>
      <div className="bubble bubble-5">
        <div className="bubble-orb"></div>
      </div>

      <div className="hero-brand">
        <div className="hero-logo-circle">L</div>
        <span>Lumière</span>
      </div>

      <div className="hero-content">
        <div className="hero-pill">✦ Beauty Awaits</div>

        <h1>Your beauty journey starts here</h1>

        <p>
          Join thousands of beauty lovers and access premium products,
          exclusive deals, and personalized recommendations.
        </p>

        <ul className="hero-list">
          <li>Access exclusive member discounts</li>
          <li>Track your orders easily</li>
          <li>Save your favorites wishlist</li>
        </ul>
      </div>

      <div className="testimonial-card">
        <div key={activeTestimonial.id} className="testimonial-card__content">
          <div className="testimonial-avatar">{activeTestimonial.initial}</div>

          <div className="testimonial-card__text-block">
            <h4>{activeTestimonial.author}</h4>
            <span>{activeTestimonial.role}</span>
            <p>"{activeTestimonial.content}"</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthHeroPanel;
