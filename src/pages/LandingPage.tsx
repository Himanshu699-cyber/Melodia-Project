import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export interface LandingPageProps {
  readonly className?: string;
}

const DISC_ARTWORK = [
  { type: 'logo' as const },
  { type: 'art' as const, url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80', title: 'Nightcall', artist: 'Kavinsky' },
  { type: 'art' as const, url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', title: 'Midnight Drive', artist: 'Aether Vibe' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Ad-supported streaming',
      'Standard audio quality (128kbps)',
      'Shuffle play only on mobile',
      'Access to public playlists',
    ],
    highlight: false,
  },
  {
    name: 'Plus',
    price: '$4.99',
    period: '/month',
    features: [
      'Ad-free listening',
      'High quality audio (320kbps)',
      'Unlimited skips',
      'Offline downloads (up to 5,000 tracks)',
      'AI-generated playlists',
    ],
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    features: [
      'Everything in Plus',
      'Lossless / studio-quality audio',
      'Unlimited offline downloads',
      'Early access to AI Music Studio',
      'Priority support',
    ],
    highlight: false,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [artworkIndex, setArtworkIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setArtworkIndex((prev) => (prev + 1) % DISC_ARTWORK.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const currentArtwork = DISC_ARTWORK[artworkIndex];

  return (
    <div className={`font-body-md text-on-surface antialiased min-h-screen flex flex-col bg-[#0B0B0B] selection:bg-primary-container selection:text-on-primary-container ${className} select-none`}>
      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .vinyl-ring {
          animation: vinyl-spin 5s linear infinite;
          transform-origin: center;
         will-change: transform;

        }
        @keyframes label-fade {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        .label-fade {
          animation: label-fade 5s ease-in-out;
        }
      `}</style>

      {/* TopNavBar */}
      <header className="flex justify-between items-center px-margin w-full sticky top-0 z-50 bg-[#0B0B0B] border-b border-charcoal h-[64px]">
        <div className="flex items-center gap-xl">
          <Link to="/" className="font-headline-md text-headline-md font-bold brand-red tracking-tight">
            Melodify
          </Link>
          <nav className="hidden md:flex gap-md">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-white transition-colors" href="#">Home</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-white transition-colors" href="#about">About</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-white transition-colors" href="#plans">Plans</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-white transition-colors" href="#contact">Contact</a>
          </nav>
        </div>
        <div className="flex items-center gap-md">
          <Link to="/login" className="font-label-md text-label-md text-on-surface-variant hover:text-white transition-colors hidden md:block">
            Login
          </Link>
          <button
            onClick={handleGetStarted}
            className="brand-red-bg text-white font-label-md text-label-md px-md py-sm rounded hover:bg-opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-margin py-[100px] max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-[64px]">

          {/* Left: Rotating disc + title beneath it */}
          <div className="flex-1 flex flex-col items-center gap-lg">
            <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px]">
              {/* Outer rotating vinyl ring */}
              <div
                className="vinyl-ring absolute inset-0 rounded-full"
                style={{
  background: `
    radial-gradient(circle at center,
      #181818 0%,
      #181818 26%,

      #090909 27%,
      #090909 29%,

      #e29044 30%,
      #8b0505 48%,
      #1b1b1b 72%,
      #110101 100%
    ),

    repeating-radial-gradient(
      circle at center,
      rgba(231, 40, 40, 0.04) 0px,
      rgba(255,255,255,0.035) 1px,
      rgba(0,0,0,0) 2px,
      rgba(0,0,0,0) 4px
    ),

    repeating-conic-gradient(
      from 0deg,
      rgba(197, 97, 97, 0.02) 0deg,
      rgba(255,255,255,0.005) 2deg,
      rgba(0,0,0,0.03) 4deg,
      rgba(255,255,255,0.01) 6deg
    )
  `,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: `
    inset 0 0 18px rgba(255,255,255,0.05),
    inset 0 0 70px rgba(0,0,0,0.65),
    0 0 45px rgba(229,9,20,0.25)
  `,
}}
              >
              {/* Temporary marker to verify rotation */}
<div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500" />
</div>
              {/* Static center label — not part of the rotating element */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                
                <div className="w-[140px] h-[140px] rounded-full overflow-hidden relative border border-[#202020] shadow-2xl">
                  <div key={artworkIndex} className="label-fade w-full h-full flex items-center justify-center">
                    {currentArtwork.type === 'logo' ? (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="material-symbols-outlined brand-red text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          graphic_eq
                        </span>
                        <span className="font-headline-sm font-bold brand-red text-[13px] tracking-tight">Melodify</span>
                      </div>
                    ) : (
                      <img
                        src={currentArtwork.url}
                        alt={currentArtwork.title}
                        className="w-full h-full object-cover scale-[1.06]"
                        style={{
                          maskImage:
                            "radial-gradient(circle, rgba(0,0,0,1) 86%, rgba(0,0,0,0.75) 94%, transparent 100%)",
                          WebkitMaskImage:
                            "radial-gradient(circle, rgba(0,0,0,1) 86%, rgba(0,0,0,0.75) 94%, transparent 100%)",
                        }}
/>                      
                    )}
                  </div>
                </div>
              </div>
            </div>

            <h1 className="font-headline-xl text-[40px] md:text-[52px] leading-tight font-bold tracking-tight text-white text-center">
              Feel Every Beat.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[420px] text-center">
              Discover millions of songs, create playlists, and enjoy AI-powered recommendations tailored to your unique soundscape.
            </p>
          </div>

          {/* Right: Get Started / Login column */}
          <div className="flex flex-col gap-md w-full max-w-[280px]">
            <button
              onClick={handleGetStarted}
              className="w-full brand-red-bg text-white font-label-lg text-label-lg font-semibold px-xl py-lg rounded-lg hover:bg-opacity-90 transition-all hover:scale-[1.02]"
            >
              Get Started
            </button>
            <Link
              to="/login"
              className="w-full text-center bg-black text-white border-2 border-red-600 font-label-lg text-label-lg font-semibold px-xl py-lg rounded-lg transition-all hover:scale-[1.02]"
              style={{ boxShadow: '0 0 24px rgba(229,9,20,0.45)' }}
            >
              Login
            </Link>
          </div>
        </section>

        {/* About Us Section — glass + red glow */}
        <section className="px-margin py-[100px] relative overflow-hidden" id="about">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
          />
          <div
            className="max-w-5xl mx-auto relative rounded-2xl p-xl md:p-[64px] text-center"
            style={{
              background: 'rgba(255,255,255,0.035)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 0 60px rgba(229,9,20,0.15), 0 20px 50px rgba(0,0,0,0.4)',
            }}
          >
            <h2 className="font-headline-lg text-headline-lg font-bold text-white mb-md">About Melodify</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Melodify was built for people who don't just listen to music — they live in it. We combine a massive
              streaming catalog with AI-powered curation that actually learns your taste, so every playlist feels
              hand-picked. Whether you're chasing the perfect late-night synthwave drive or building a focus
              playlist for deep work, Melodify adapts to your mood, not the other way around. No noise, no filler —
              just the sound you're actually looking for, delivered in studio-quality audio.
            </p>
          </div>
        </section>

        {/* Subscription Plans Section — glass + red glow */}
        <section className="px-margin py-[100px] relative overflow-hidden" id="plans">
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(229,9,20,0.14) 0%, transparent 70%)', filter: 'blur(50px)' }}
          />
          <div className="max-w-6xl mx-auto relative">
            <h2 className="font-headline-lg text-headline-lg font-bold text-white text-center mb-md">Choose your plan</h2>
            <p className="font-body-md text-on-surface-variant text-center max-w-xl mx-auto mb-[56px]">
              Start free, upgrade whenever you want more. Cancel anytime.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg items-start">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-2xl p-xl relative flex flex-col gap-md"
                  style={{
                    background: 'rgba(255,255,255,0.035)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: plan.highlight ? '1px solid rgba(229,9,20,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: plan.highlight
                      ? '0 0 50px rgba(229,9,20,0.35), 0 20px 40px rgba(0,0,0,0.4)'
                      : '0 0 30px rgba(229,9,20,0.08), 0 20px 40px rgba(0,0,0,0.3)',
                  }}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 brand-red-bg text-white text-[10px] font-bold uppercase tracking-wider px-md py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-headline-md text-headline-md font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-xs">
                    <span className="text-[36px] font-extrabold text-white">{plan.price}</span>
                    <span className="text-sm text-on-surface-variant">{plan.period}</span>
                  </div>
                  <ul className="flex flex-col gap-sm mt-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-xs text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined brand-red text-[18px] shrink-0 mt-0.5">check_circle</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleGetStarted}
                    className={`mt-md w-full py-sm rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] ${
                      plan.highlight
                        ? 'brand-red-bg text-white'
                        : 'bg-black border border-charcoal text-white hover:bg-[#181818]'
                    }`}
                  >
                    {plan.name === 'Free' ? 'Get Started' : `Choose ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="px-margin py-[100px] max-w-3xl mx-auto text-center" id="contact">
          <h2 className="font-headline-lg text-headline-lg font-bold text-white mb-md">Still have questions?</h2>
          <p className="font-body-md text-on-surface-variant mb-lg">
            Reach out and our team will get back to you within 24 hours.
          </p>
          
          <a
            href="mailto:support@melodify.com"
            className="inline-block brand-red-bg text-white font-label-md text-label-md px-xl py-md rounded hover:bg-opacity-90 transition-opacity"
          >
            Contact Us
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-charcoal text-center text-xs text-on-surface-variant font-mono bg-black/40">
        &copy; {new Date().getFullYear()} Melodify Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;