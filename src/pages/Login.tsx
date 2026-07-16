import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, googleAuth, clearError } from '../store/authSlice';
import type { RootState } from '../store';
import axios from 'axios';
import { addNotification } from '../store/playlistSlice';

export interface LoginProps {
  readonly className?: string;
}

export const Login: React.FC<LoginProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot / Reset Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1 = Request code, 2 = Submit new pass
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const result = await dispatch(loginUser({ email, password, rememberMe }) as any);
    if (loginUser.fulfilled.match(result)) {
      dispatch(addNotification({ message: 'Login successful!', type: 'success' }));
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    // Mock Google signin popup prompt
    const mockEmail = prompt('Enter your Google Email to simulate login:', 'google.user@gmail.com');
    if (!mockEmail) return;
    const name = mockEmail.split('@')[0];

    const result = await dispatch(googleAuth({
      googleId: `google_id_${Math.floor(Math.random() * 100000)}`,
      email: mockEmail,
      username: name.charAt(0).toUpperCase() + name.slice(1),
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`
    }) as any);

    if (googleAuth.fulfilled.match(result)) {
      dispatch(addNotification({ message: 'Logged in with Google!', type: 'success' }));
      navigate('/dashboard');
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email: forgotEmail });
      if (response.data.success) {
        alert(`Reset code generated for demo: ${response.data.resetCode}`);
        setStep(2);
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Email lookup failed');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        email: forgotEmail,
        code: resetCode,
        newPassword
      });
      if (response.data.success) {
        dispatch(addNotification({ message: 'Password reset successful!', type: 'success' }));
        setShowForgotModal(false);
        setStep(1);
        setForgotEmail('');
        setResetCode('');
        setNewPassword('');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <div className={`w-full max-w-[1440px] h-screen md:h-[800px] flex flex-col md:flex-row bg-[#0B0B0B] overflow-hidden mx-auto select-none border border-charcoal ${className}`}>

      {/* Left Side - Visualizer Image Banner */}
      <div className="hidden md:flex md:w-[40%] bg-surface-container-lowest h-full relative border-r border-[#262626]">
        <svg
          viewBox="0 0 400 500"
          className="absolute inset-0 w-full h-full opacity-90"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="400" height="500" fill="#0B0B0B" />
          {/* Waveform */}
          <path
            d="M -20 180 Q 40 100 80 180 T 160 180 L 160 260 Q 160 350 200 250 L 200 90 Q 200 60 220 90 L 240 260 L 260 220 L 280 180 Q 340 120 420 180"
            fill="none"
            stroke="#E50914"
            strokeWidth="2"
            opacity="0.85"
          />
          {/* Decorative shapes */}
          <circle cx="60" cy="150" r="4" fill="#E50914" opacity="0.6" />
          <circle cx="240" cy="380" r="4" fill="#E50914" opacity="0.6" />
          <polygon points="130,220 150,220 140,240" fill="#E50914" opacity="0.4" />
          <polygon points="240,120 262,110 262,132" fill="#E50914" opacity="0.3" />
          {/* Headphones */}
          <path
            d="M 90 330 A 90 90 0 0 1 270 330"
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="6"
          />
          <rect x="75" y="330" width="34" height="60" rx="14" fill="#1a1a1a" stroke="#E50914" strokeWidth="2" />
          <rect x="251" y="330" width="34" height="60" rx="14" fill="#1a1a1a" stroke="#E50914" strokeWidth="2" />
          {/* Vinyl record */}
          <circle cx="230" cy="400" r="60" fill="#141414" stroke="#2a2a2a" strokeWidth="2" />
          <circle cx="230" cy="400" r="45" fill="none" stroke="#2a2a2a" strokeWidth="1" />
          <circle cx="230" cy="400" r="30" fill="none" stroke="#2a2a2a" strokeWidth="1" />
          <circle cx="230" cy="400" r="16" fill="#E50914" />
          <circle cx="230" cy="400" r="4" fill="#0B0B0B" />
        </svg>
        <div className="absolute bottom-10 left-10 z-10">
          <h1 className="font-headline-xl text-headline-xl text-white mb-2">Melodify</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[300px]">
            Professional grade audio management and analytics for serious creators.
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full md:w-[60%] flex items-center justify-center p-6 md:p-12 h-full bg-[#000000]">

        {/* Login Card */}
        <div className="w-full max-w-[440px] bg-[#0a0a0a] border border-[#262626] rounded p-8 space-y-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-white mb-2">Welcome Back</h2>
            <p className="font-body-md text-body-md text-[#a3a3a3]">
              Enter your credentials to access your studio.
            </p>
          </div>

          {error && (
            <div className="p-sm bg-primary/10 border border-primary text-xs text-primary font-mono rounded">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider font-mono">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="w-full bg-[#131313] border border-[#262626] rounded px-md py-3 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-primary input-focus font-sans"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider font-mono">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-primary hover:underline font-mono"
                >
                  Forgot password?
                </button>
              </div>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#131313] border border-[#262626] rounded px-md py-3 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-primary input-focus font-sans"
              />
            </div>

            {/* Keep Signed In */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 bg-[#131313] border-[#262626] text-primary focus:ring-0 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-[#a3a3a3] font-medium cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold text-sm rounded hover:bg-opacity-95 transition-opacity font-bold uppercase tracking-wider"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Social Logins */}
          <div className="space-y-4">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-charcoal"></div>
              <span className="flex-shrink mx-4 text-on-surface-variant font-mono text-xs uppercase">or</span>
              <div className="flex-grow border-t border-charcoal"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-[#131313] hover:bg-[#202020] border border-[#262626] rounded text-white flex items-center justify-center gap-xs font-semibold text-sm transition-colors"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="text-center pt-sm">
            <p className="text-xs text-[#a3a3a3]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-bold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD / RESET PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForgotModal(false)} />
          <div className="bg-[#0a0a0a] border border-[#262626] rounded p-lg w-full max-w-[420px] z-10 space-y-md relative">
            <h3 className="font-headline-lg text-headline-lg text-white font-bold">
              {step === 1 ? 'Reset Password' : 'Enter Verification Code'}
            </h3>

            {modalError && (
              <div className="p-xs bg-primary/10 border border-primary text-xs text-primary font-mono rounded">
                {modalError}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-md">
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider font-mono">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#131313] border border-charcoal rounded px-md py-2 text-white text-sm focus:outline-none focus:border-primary input-focus font-sans"
                  />
                </div>
                <div className="flex gap-md justify-end pt-xs">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-md py-2 border border-charcoal text-xs text-white rounded font-medium hover:bg-[#202020]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-md py-2 bg-primary text-white rounded text-xs font-bold hover:bg-opacity-90"
                  >
                    Request Code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-md">
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider font-mono">
                    Reset Code
                  </label>
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full bg-[#131313] border border-charcoal rounded px-md py-2 text-white text-sm focus:outline-none focus:border-primary input-focus font-sans"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider font-mono">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#131313] border border-charcoal rounded px-md py-2 text-white text-sm focus:outline-none focus:border-primary input-focus font-sans"
                  />
                </div>
                <div className="flex gap-md justify-end pt-xs">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-md py-2 border border-charcoal text-xs text-white rounded font-medium hover:bg-[#202020]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-md py-2 bg-primary text-white rounded text-xs font-bold hover:bg-opacity-90"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
