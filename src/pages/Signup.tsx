import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from '../store/authSlice';
import type { RootState } from '../store';
import { addNotification } from '../store/playlistSlice';

export interface SignupProps {
  readonly className?: string;
}

export const Signup: React.FC<SignupProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!username || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    const result = await dispatch(signupUser({ username, email, password }) as any);
    if (signupUser.fulfilled.match(result)) {
      dispatch(addNotification({ message: 'Account created successfully!', type: 'success' }));
      navigate('/dashboard');
    }
  };

  return (
    <div className={`w-full max-w-[1440px] h-screen md:h-[800px] flex flex-col md:flex-row bg-[#0B0B0B] overflow-hidden mx-auto select-none border border-charcoal ${className}`}>

      {/* Left Side - Visualizer Image Banner */}
      <div className="hidden md:flex md:w-[40%] bg-surface-container-lowest h-full relative border-r border-[#262626] flex-col justify-between">
        <svg
          viewBox="0 0 400 500"
          className="absolute inset-0 w-full h-full opacity-70"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="400" height="500" fill="#0B0B0B" />
          {/* Network / circuit style nodes and lines */}
          <line x1="60" y1="150" x2="220" y2="220" stroke="#E50914" strokeWidth="1" opacity="0.4" />
          <line x1="220" y1="220" x2="340" y2="140" stroke="#E50914" strokeWidth="1" opacity="0.4" />
          <line x1="220" y1="220" x2="140" y2="330" stroke="#E50914" strokeWidth="1" opacity="0.4" />
          <line x1="220" y1="220" x2="320" y2="360" stroke="#E50914" strokeWidth="1" opacity="0.4" />
          <line x1="140" y1="330" x2="80" y2="420" stroke="#E50914" strokeWidth="1" opacity="0.3" />
          <circle cx="60" cy="150" r="5" fill="#E50914" opacity="0.7" />
          <circle cx="220" cy="220" r="6" fill="#E50914" />
          <circle cx="340" cy="140" r="4" fill="#E50914" opacity="0.6" />
          <circle cx="140" cy="330" r="4" fill="#E50914" opacity="0.6" />
          <circle cx="320" cy="360" r="5" fill="#E50914" opacity="0.7" />
          <circle cx="80" cy="420" r="3" fill="#E50914" opacity="0.5" />
          {/* Isometric cube shapes suggesting mixer/synth pads */}
          <rect x="150" y="270" width="40" height="40" fill="none" stroke="#2a2a2a" strokeWidth="1.5" transform="rotate(20 170 290)" />
          <rect x="240" y="180" width="30" height="30" fill="none" stroke="#2a2a2a" strokeWidth="1.5" transform="rotate(-15 255 195)" />
        </svg>
        <div className="p-10 z-10">
          <h1 className="font-headline-xl text-headline-xl text-white mb-2">Music Sign-up</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[300px]">
            Join the platform built for serious creators and industry professionals.
          </p>
        </div>
        <div className="p-10 z-10">
          <p className="text-primary font-bold text-lg">Unlock Premium Features</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full md:w-[60%] flex items-center justify-center p-6 md:p-12 h-full bg-[#000000]">

        {/* Signup Card */}
        <div className="w-full max-w-[440px] bg-[#0a0a0a] border border-[#262626] rounded p-8 space-y-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-white mb-2">Create Account</h2>
            <p className="font-body-md text-body-md text-[#a3a3a3]">
              Enter your details to access the professional workspace.
            </p>
          </div>

          {(error || validationError) && (
            <div className="p-sm bg-primary/10 border border-primary text-xs text-primary font-mono rounded">
              {validationError || error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider font-mono">
                Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#525252] text-[18px]">
                  person
                </span>
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="producer_name"
                  className="w-full bg-[#131313] border border-[#262626] rounded pl-10 pr-md py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-primary input-focus font-sans"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider font-mono">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#525252] text-[18px]">
                  mail
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="studio@example.com"
                  className="w-full bg-[#131313] border border-[#262626] rounded pl-10 pr-md py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-primary input-focus font-sans"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#525252] text-[18px]">
                  lock
                </span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#131313] border border-[#262626] rounded pl-10 pr-md py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-primary input-focus font-sans"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider font-mono">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#525252] text-[18px]">
                  lock_reset
                </span>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#131313] border border-[#262626] rounded pl-10 pr-md py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-primary input-focus font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold text-sm rounded hover:bg-opacity-95 transition-opacity font-bold uppercase tracking-wider"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-xs">
            <p className="text-xs text-[#a3a3a3]">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-bold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
