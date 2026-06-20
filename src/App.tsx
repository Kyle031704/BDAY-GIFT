import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PartyPopper, Home } from 'lucide-react';


// Curation of 16 gorgeous, high-contrast, premium resolution celebration images for the carousel
const CAROUSEL_IMAGES = [
  '/images/photo1.jpg',
  '/images/photo2.jpg',
  '/images/photo3.jpg',
  '/images/photo4.jpg',
  '/images/photo5.jpg',
  '/images/photo6.jpg',
  '/images/photo7.jpg',
  '/images/photo8.jpg',
  '/images/photo9.jpg',
  '/images/photo10.jpg',
  '/images/photo11.jpg',
  '/images/photo12.jpg',
  '/images/photo13.jpg',
  '/images/photo14.jpg',
  '/images/photo15.jpg',
];

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
}

// Custom interactive canvas particles component with dual side-cannon and middle bursts
function CanvasConfetti({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    if (trigger === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Beautiful high-contrast primary palette colors (white, sky azure, and silver slates)
    const colors = [
      '#ffffff', // Pure white
      '#ffffff', // Bold white highlight
      '#e2e8f0', // Pristine silver
      '#cbd5e1', // Cool metallic slate
      '#a8c8ff', // Electric Primary Azure
      '#d6e3ff', // Soft Sky Blue
    ];

    const w = canvas.width;
    const h = canvas.height;

    // Firing function to spawn particles at custom orientations
    const spawnBurst = (x: number, y: number, type: 'center' | 'left' | 'right' | 'upper-left' | 'upper-right') => {
      const count = type === 'center' ? 45 : 65; // Side cannons carry extra volume!
      for (let i = 0; i < count; i++) {
        idCounter.current++;
        let angle = 0;
        let speed = 0;

        if (type === 'center') {
          angle = Math.random() * Math.PI * 2;
          speed = 3 + Math.random() * 8;
        } else if (type === 'left') {
          // Firing bottom left diagonally up-right (aiming higher-center)
          angle = -Math.PI / 12 - Math.random() * (Math.PI / 3); // -15 to -75 degrees
          speed = 8 + Math.random() * 15;
        } else if (type === 'right') {
          // Firing bottom right diagonally up-left (aiming higher-center)
          angle = -Math.PI + Math.PI / 12 + Math.random() * (Math.PI / 3); // -165 to -105 degrees
          speed = 8 + Math.random() * 15;
        } else if (type === 'upper-left') {
          // Firing top left diagonally down-right (e.g. 15 to 75 degrees)
          angle = Math.PI / 12 + Math.random() * (Math.PI / 3);
          speed = 6 + Math.random() * 12;
        } else if (type === 'upper-right') {
          // Firing top right diagonally down-left (e.g. 105 to 165 degrees)
          angle = Math.PI - Math.PI / 12 - Math.random() * (Math.PI / 3);
          speed = 6 + Math.random() * 12;
        }

        particlesRef.current.push({
          id: idCounter.current,
          x: x,
          y: y,
          size: Math.random() * 6 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed - (type === 'center' ? 3 : 1), // extra upward bias
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 8,
          opacity: 1,
          decay: 0.005 + Math.random() * 0.01,
        });
      }
    };

    // 1. Center Burst
    spawnBurst(w / 2, h / 2, 'center');
    // 2. Left side cannon
    spawnBurst(0, h, 'left');
    // 3. Right side cannon
    spawnBurst(w, h, 'right');
    // 4. Upper Left side cannon
    spawnBurst(0, 0, 'upper-left');
    // 5. Upper Right side cannon
    spawnBurst(w, 0, 'upper-right');

    let animFrame: number;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.22; // Gravity pull down
        p.speedX *= 0.96; // Air drag resistance
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (i % 3 === 0) {
          // Sparkle circular star particles
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Crisp ticker rectangles
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5);
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        animFrame = requestAnimationFrame(tick);
      }
    };

    animFrame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrame);
    };
  }, [trigger]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" id="confetti-canvas" />;
}

// Aesthetic horizontally scrolling movie film strip component
function HorizontalFilmStrip({ direction = 'left' }: { direction?: 'left' | 'right' }) {
  // Create an array of 64 blank frames to ensure sufficient width for seamless looping
  const loopFrames = Array.from({ length: 72 });

  return (
    <div className="w-full bg-[#111111]/90 border-t border-b border-neutral-900/40 py-1 md:py-1.5 select-none overflow-hidden relative z-0 flex shadow-[0_0_24px_rgba(0,0,0,0.85)]">
      <div className={`flex whitespace-nowrap min-w-full items-center gap-2.5 sm:gap-4 shrink-0 ${direction === 'left' ? 'animate-film-left' : 'animate-film-right'}`}>
        {loopFrames.map((_, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 bg-[#161616] border border-neutral-800/80 h-9 w-[50px] sm:h-13 sm:w-[76px] md:h-18 md:w-[108px] rounded flex flex-col justify-between items-center py-0.5 sm:py-1 relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.95)] px-0.5 sm:px-1"
          >
            {/* Top sprockets */}
            <div className="absolute top-0.5 inset-x-0 flex justify-around px-0.5 pointer-events-none">
              <span className="w-1 h-0.5 sm:w-1.5 sm:h-1 bg-black border border-neutral-950/90 rounded-2xs" />
              <span className="w-1 h-0.5 sm:w-1.5 sm:h-1 bg-black border border-neutral-950/90 rounded-2xs" />
              <span className="w-1 h-0.5 sm:w-1.5 sm:h-1 bg-black border border-neutral-950/90 rounded-2xs" />
            </div>

            {/* Frame Inner Detail - Blueish White box representing exposure window, completely free of text */}
            <div className="w-[42px] sm:w-[64px] md:w-[94px] h-4.5 sm:h-7 md:h-10.5 bg-[#f0f5ff] border border-sky-300/30 rounded-xs shadow-[inset_0_1.5px_3.5px_rgba(15,23,42,0.18),_0_0_10px_rgba(235,243,255,0.7)] my-auto relative overflow-hidden" />

            {/* Bottom sprockets */}
            <div className="absolute bottom-0.5 inset-x-0 flex justify-around px-0.5 pointer-events-none">
              <span className="w-1 h-0.5 sm:w-1.5 sm:h-1 bg-black border border-neutral-950/90 rounded-2xs" />
              <span className="w-1 h-0.5 sm:w-1.5 sm:h-1 bg-black border border-neutral-950/90 rounded-2xs" />
              <span className="w-1 h-0.5 sm:w-1.5 sm:h-1 bg-black border border-neutral-950/90 rounded-2xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function App() {
  const [page, setPage] = useState<'landing' | 'main'>('landing');
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-playing image carousel transitions: cycles through all 16 images every 5 seconds one by one
  useEffect(() => {
    if (page !== 'main') return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [page]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/song.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
  }, []);

  const handleLandingClick = () => {
        // Play audio on click
    if (audioRef.current) {
      audioRef.current.play();
    }
    // Burst magnificent white confetti immediately from sides and middle
    setConfettiTrigger((t) => t + 1);
    
    // Transition smoothly to main celebration card
    setPage('main');
  };

  const triggerConfettiPulse = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setConfettiTrigger((t) => t + 1);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans selection:bg-primary selection:text-on-primary overflow-x-hidden relative flex flex-col justify-between" id="app-root">
      
      {/* Beautiful white and azure confetti canvas overlay */}
      <CanvasConfetti trigger={confettiTrigger} />

      <AnimatePresence mode="wait">
        {page === 'landing' ? (
          /* Landing Page: premium full-screen clickable layout matching screen.png */
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            onClick={handleLandingClick}
            className="flex-grow w-full flex flex-col items-center justify-center cursor-pointer select-none relative h-screen bg-surface"
            id="landing-container"
          >
            {/* Elegant high-contrast ambient particles background */}
            <div className="absolute inset-0 bg-radial from-transparent to-black/40 pointer-events-none" />

            <div className="px-6 sm:px-8 text-center max-w-2xl mx-auto flex flex-col items-center justify-center z-10" id="landing-center-content">
              <motion.h1
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.015, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tighter leading-none select-none pb-4 text-sweep-glow"
                id="landing-greeting"
              >
                Click anywhere :b
              </motion.h1>
              <p className="text-secondary/50 font-label-md text-xs mt-4 tracking-[0.3em] uppercase animate-pulse">
                YEP, ANYWHERE
              </p>
            </div>
          </motion.div>
        ) : (
          /* Main Birthday Celebration Card: based on BDAY.jpg with Azure Noir dark-theme */
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex-grow flex flex-col justify-between w-full relative min-h-screen pb-11 sm:pb-20 md:pb-28 pt-11 sm:pt-20 md:pt-28 overflow-hidden"
            id="main-celebration-container"
          >
            {/* Aesthetic Horizontally Scrolling Movie Film Strips (Top and Bottom) */}
            <div className="absolute top-1 left-0 right-0 w-full pointer-events-none z-0" id="horizontal-film-strip-top">
              <HorizontalFilmStrip direction="left" />
            </div>
            <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 w-full pointer-events-none z-0" id="horizontal-film-strip-bottom">
              <HorizontalFilmStrip direction="right" />
            </div>

            {/* Elegant floating square Back to Home button in top-left corner */}
            <div className="fixed top-3 left-4 z-40" id="global-nav">
              <button
                onClick={() => setPage('landing')}
                className="hover:scale-105 active:scale-95 transition-all w-9 h-9 sm:w-11 sm:h-11 text-primary bg-secondary-container/20 hover:bg-secondary-container/40 rounded-lg sm:rounded-xl border border-primary/20 cursor-pointer flex items-center justify-center shadow-lg backdrop-blur-md"
                title="Back to Home"
                id="global-home-button"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Elegant floating square confetti pop button in top-right corner to prevent layout overlay */}
            <div className="fixed top-3 right-4 z-40" id="global-header">
              <button
                onClick={triggerConfettiPulse}
                className="hover:scale-105 active:scale-95 transition-all w-9 h-9 sm:w-11 sm:h-11 text-primary bg-secondary-container/20 hover:bg-secondary-container/40 rounded-lg sm:rounded-xl border border-primary/20 cursor-pointer flex items-center justify-center shadow-lg backdrop-blur-md"
                title="Pop Confetti!"
                id="confetti-bubble-button"
              >
                <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Main Interactive Presentational Grid */}
            <main className="flex-grow flex items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-1 sm:py-4 md:py-8 max-w-7xl w-full mx-auto" id="main-content-grid">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 md:gap-12 lg:gap-16 items-center w-full" id="grid-inner-layout">
                
                {/* Left Column: Glowing Text Birthday Wishes with enlarged premium presentation */}
                <div className="flex flex-col space-y-2 sm:space-y-4 text-left order-1 md:order-1 mt-1 sm:mt-2 md:mt-0" id="left-greeting-column">
                  
                  <h1 className="font-display-lg text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] text-sweep-glow" id="celebration-heading">
                    Happy<br />Birthday!
                  </h1>

                  <p className="font-body-md text-on-surface-variant leading-relaxed max-w-md md:max-w-xl text-sm sm:text-lg md:text-lg lg:text-xl opacity-90" id="celebration-paragraph">
                    Wishing you a day filled with happiness, laughter, and wonderful memories. May all your wishes come true and each hour be filled with warmth!
                  </p>
                </div>

                {/* Right Column: Custom Polaroid Carousel Card (Without Dots & text captions) */}
                <div className="flex justify-center order-2 md:order-2 mt-2 sm:mt-6 md:mt-0" id="right-photo-column">
                  <div 
                    className="bg-surface-container border border-outline-variant/15 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.65)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_22px_60px_rgba(111,168,255,0.07)] relative overflow-hidden w-full max-w-[255px] sm:max-w-[300px] md:max-w-[400px] aspect-[4/5.1] flex flex-col cursor-pointer"
                    onClick={triggerConfettiPulse}
                    id="photo-polaroid-frame"
                  >
                    {/* Decorative taped sticker on top */}
                    <div 
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-8 sm:h-9 bg-surface-variant/40 border border-outline-variant/20 backdrop-blur-sm -rotate-2 z-20 shadow-sm"
                      id="tape-sticker"
                    />

                    {/* Image photo slide container */}
                    <div className="flex-grow rounded-lg sm:rounded-xl overflow-hidden relative bg-surface-container-lowest border border-outline-variant/10 aspect-[4/5] shadow-inner" id="carousel-viewport">
                      <AnimatePresence mode="popLayout">
                        <motion.img
                          key={currentSlide}
                          src={CAROUSEL_IMAGES[currentSlide]}
                          alt={`Birthday Celebration Phase ${currentSlide + 1}`}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.8, ease: 'easeInOut' }}
                          className="absolute inset-0 w-full h-full object-cover object-center select-none"
                          referrerPolicy="no-referrer"
                          id={`carousel-image-${currentSlide}`}
                        />
                      </AnimatePresence>
                    </div>

                    {/* Pure balanced Polaroid Bottom Area: completely removed "YOUR PHOTO HERE" text */}
                    <div className="pt-2 sm:pt-4 pb-1" id="captions" />
                  </div>
                </div>

              </div>
            </main>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
    
  );
}
