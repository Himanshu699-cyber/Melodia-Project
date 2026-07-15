import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export interface LandingPageProps {
  readonly className?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className={`font-body-md text-on-surface antialiased min-h-screen flex flex-col bg-[#0B0B0B] selection:bg-primary-container selection:text-on-primary-container ${className} select-none`}>
      {/* TopNavBar */}
      <header className="flex justify-between items-center px-margin w-full sticky top-0 z-50 bg-[#0B0B0B] border-b border-charcoal h-[64px]">
        <div className="flex items-center gap-xl">
          <Link to="/" className="font-headline-md text-headline-md font-bold brand-red tracking-tight">
            Melodify
          </Link>
          <nav className="hidden md:flex gap-md">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-white transition-colors" href="#">Home</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-white transition-colors" href="#features">Features</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-white transition-colors" href="#about">About</a>
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

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-margin py-[120px] max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-[64px]">
          <div className="flex-1 flex flex-col gap-lg z-10">
            <h1 className="font-headline-xl text-[48px] md:text-[64px] leading-tight font-bold tracking-tight text-white">
              Feel Every Beat.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[480px]">
              Discover millions of songs, create playlists, and enjoy AI-powered recommendations tailored to your unique soundscape.
            </p>
            <div className="flex gap-md mt-sm">
              <button 
                onClick={handleGetStarted}
                className="brand-red-bg text-white font-label-md text-label-md px-xl py-md rounded hover:bg-opacity-90 transition-opacity"
              >
                Get Started
              </button>
              <Link 
                to="/login"
                className="bg-[#181818] text-white border border-charcoal font-label-md text-label-md px-xl py-md rounded hover:bg-[#262626] transition-colors flex items-center justify-center"
              >
                Explore Music
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div 
              className="bg-cover bg-center w-full aspect-video rounded-xl border border-charcoal" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80')" }}
            />
            <div className="absolute -bottom-md -left-md p-md card-bg border border-charcoal rounded-lg flex items-center gap-md shadow-2xl">
              <span className="material-symbols-outlined brand-red text-[32px]">graphic_eq</span>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">Now Playing</div>
                <div className="font-label-md text-label-md font-bold text-white">Midnight Synth</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-margin py-[80px] bg-[#0a0a0a] border-t border-b border-charcoal" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
              {/* Feature 1 */}
              <div className="card-bg p-xl rounded-lg border border-charcoal flex flex-col gap-md hover:bg-[#202020] transition-colors">
                <span className="material-symbols-outlined brand-red text-[32px]">psychology</span>
                <h3 className="font-headline-md text-headline-md font-bold text-white">AI Smart Playlist</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Algorithms that learn your taste and curate the perfect mix for any mood.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="card-bg p-xl rounded-lg border border-charcoal flex flex-col gap-md hover:bg-[#202020] transition-colors">
                <span className="material-symbols-outlined brand-red text-[32px]">cloud_sync</span>
                <h3 className="font-headline-md text-headline-md font-bold text-white">Cloud Streaming</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Access your entire library from anywhere, instantly synced across all devices.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="card-bg p-xl rounded-lg border border-charcoal flex flex-col gap-md hover:bg-[#202020] transition-colors">
                <span className="material-symbols-outlined brand-red text-[32px]">high_quality</span>
                <h3 className="font-headline-md text-headline-md font-bold text-white">High Quality Audio</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Experience lossless audio streaming that preserves every detail of the original recording.
                </p>
              </div>
              {/* Feature 4 */}
              <div className="card-bg p-xl rounded-lg border border-charcoal flex flex-col gap-md hover:bg-[#202020] transition-colors">
                <span className="material-symbols-outlined brand-red text-[32px]">enhanced_encryption</span>
                <h3 className="font-headline-md text-headline-md font-bold text-white">Secure Account</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Enterprise-grade security ensures your data and playlists are always protected.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="px-margin py-[80px] max-w-7xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg font-bold mb-xl flex items-center gap-sm text-white">
            <span className="brand-red">|</span> Trending Now
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {/* Album 1 */}
            <div className="group cursor-pointer">
              <div 
                className="w-full aspect-square rounded-lg border border-charcoal mb-sm group-hover:border-[#404040] transition-colors relative overflow-hidden bg-cover bg-center" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60')" }}
              >
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-[48px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                </div>
              </div>
              <div className="font-label-md text-label-md font-bold text-white truncate">Neon Shadows</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant truncate">The Synthetics</div>
            </div>

            {/* Album 2 */}
            <div className="group cursor-pointer">
              <div 
                className="w-full aspect-square rounded-lg border border-charcoal mb-sm group-hover:border-[#404040] transition-colors relative overflow-hidden bg-cover bg-center" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60')" }}
              >
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-[48px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                </div>
              </div>
              <div className="font-label-md text-label-md font-bold text-white truncate">Midnight Drive</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant truncate">Aether Vibe</div>
            </div>

            {/* Album 3 */}
            <div className="group cursor-pointer">
              <div 
                className="w-full aspect-square rounded-lg border border-charcoal mb-sm group-hover:border-[#404040] transition-colors relative overflow-hidden bg-cover bg-center" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=60')" }}
              >
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-[48px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                </div>
              </div>
              <div className="font-label-md text-label-md font-bold text-white truncate">Analog Whispers</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant truncate">Lofi Scholar</div>
            </div>

            {/* Album 4 */}
            <div className="group cursor-pointer">
              <div 
                className="w-full aspect-square rounded-lg border border-charcoal mb-sm group-hover:border-[#404040] transition-colors relative overflow-hidden bg-cover bg-center" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60')" }}
              >
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-[48px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                </div>
              </div>
              <div className="font-label-md text-label-md font-bold text-white truncate">Subterranean Bass</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant truncate">Glow Worm</div>
            </div>
          </div>
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
