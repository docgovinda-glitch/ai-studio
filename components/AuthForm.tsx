import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Key, Phone, User, AlertCircle, Check, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/AuthCard';

interface SocialButtonProps {
  platform: 'google' | 'facebook' | 'github';
  onClick: () => void;
}

function SocialButton({ platform, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 items-center justify-center rounded-lg border border-border bg-background/50 hover:bg-accent/40 text-xs font-semibold text-foreground transition capitalize cursor-pointer"
    >
      {platform}
    </button>
  );
}

// Types for user profile (same as in login page)
type UserProfile = {
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  address?: string;
  countryCode?: string;
  email: string;
  phone: string;
  photo: string;
  password?: string;
  role: 'user' | 'admin';
  preferredModel?: string;
};

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Common state
  const [profilePhoto, setProfilePhoto] = useState('/api/placeholder/120/120');

  // Sign‑in state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign‑up state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [preferredModel, setPreferredModel] = useState('gpt-4o-mini');

  // ---------------------------------------------------------------------------
  // Helper functions (mirroring the original logic but trimmed for brevity)
  // ---------------------------------------------------------------------------
  const handleSocialLogin = (platform: 'google' | 'facebook' | 'github') => {
    setError('');
    setSuccess(`Connecting to ${platform}...`);
    // Simulated OAuth – in a real project this would redirect to /api/auth/signin
    setTimeout(() => {
      const socialUser: UserProfile = {
        firstName: `${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        lastName: 'User',
        email: `guest@${platform}.com`,
        phone: '+1 (555) 000‑0000',
        photo: profilePhoto,
        role: 'user',
        preferredModel,
      };
      // Store mock user if not present
      const raw = localStorage.getItem('everest_registered_users');
      const users: UserProfile[] = raw ? JSON.parse(raw) : [];
      if (!users.some(u => u.email === socialUser.email)) {
        users.push(socialUser);
        localStorage.setItem('everest_registered_users', JSON.stringify(users));
      }
      localStorage.setItem('is_authenticated', 'true');
      localStorage.setItem('current_user', JSON.stringify(socialUser));
      localStorage.setItem('current_user_role', socialUser.role);
      setSuccess('Authentication successful!');
      setTimeout(() => {
        router.push(socialUser.role === 'admin' ? '/admin' : '/settings');
      }, 800);
    }, 1200);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please fill in all credentials.');
      return;
    }
    const raw = localStorage.getItem('everest_registered_users');
    const users: UserProfile[] = raw ? JSON.parse(raw) : [];
    const matched = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword);
    if (!matched) {
      setError('Invalid email or password.');
      return;
    }
    localStorage.setItem('is_authenticated', 'true');
    localStorage.setItem('current_user', JSON.stringify(matched));
    localStorage.setItem('current_user_role', matched.role);
    setSuccess('Login successful!');
    setTimeout(() => {
      router.push(matched.role === 'admin' ? '/admin' : '/settings');
    }, 800);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim() || !signupEmail.trim() || !signupPhone.trim() || !signupPassword.trim()) {
      setError('Please fill in all mandatory onboarding fields.');
      return;
    }
    const raw = localStorage.getItem('everest_registered_users');
    const users: UserProfile[] = raw ? JSON.parse(raw) : [];
    if (users.some(u => u.email.toLowerCase() === signupEmail.toLowerCase())) {
      setError('An account with this email already exists.');
      return;
    }
    const newUser: UserProfile = {
      firstName,
      middleName,
      lastName,
      address,
      countryCode,
      email: signupEmail,
      phone: signupPhone,
      photo: profilePhoto,
      password: signupPassword,
      role: 'user',
      preferredModel,
    };
    users.push(newUser);
    localStorage.setItem('everest_registered_users', JSON.stringify(users));
    localStorage.setItem('is_authenticated', 'true');
    localStorage.setItem('current_user', JSON.stringify(newUser));
    localStorage.setItem('current_user_role', 'user');
    setSuccess('Onboarding complete!');
    setTimeout(() => router.push('/settings'), 1000);
  };

  // ---------------------------------------------------------------------------
  // UI rendering
  // ---------------------------------------------------------------------------
  return (
    <AuthCard title={mode === 'signin' ? 'Sign In' : 'Create Account'}>
      {/* Centered profile picture (or placeholder) */}
      <div className="flex flex-col items-center mb-4">
        <img
          src={profilePhoto}
          alt="Profile preview"
          className="size-24 rounded-full object-cover border border-border"
        />
        {mode === 'signup' && (
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => setProfilePhoto('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop')}
              className="px-2.5 py-1 text-[10px] rounded border border-border hover:bg-accent/40 text-foreground transition"
            >
              Avatar 1
            </button>
            <button
              type="button"
              onClick={() => setProfilePhoto('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop')}
              className="px-2.5 py-1 text-[10px] rounded border border-border hover:bg-accent/40 text-foreground transition"
            >
              Avatar 2
            </button>
          </div>
        )}
      </div>

      {/* Error / success alerts */}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs mb-4 animate-in fade-in">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-xs mb-4 animate-in fade-in">
          <Check className="size-4 shrink-0 mt-0.5 animate-bounce" />
          <span>{success}</span>
        </div>
      )}

      {mode === 'signin' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-10 pl-9 rounded-lg border border-border bg-background/50 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full h-10 pl-9 rounded-lg border border-border bg-background/50 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-10 font-semibold">
            Sign In to Everest
          </Button>
          {/* Social buttons */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
            <span className="relative px-3 text-[10px] bg-background text-muted-foreground uppercase font-bold tracking-wider">
              Or Continue With
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <SocialButton platform="google" onClick={() => handleSocialLogin('google')} />
            <SocialButton platform="facebook" onClick={() => handleSocialLogin('facebook')} />
            <SocialButton platform="github" onClick={() => handleSocialLogin('github')} />
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
          {/* Mandatory fields */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase border-b border-border/40 pb-1 flex items-center gap-1.5">
              <User className="size-3.5" /> 1. Basic Account Info (Mandatory)
            </h3>
            {/* First, middle, last name */}
            <div className="grid gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Alice"
                  className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid gap-1 mt-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Middle Name (Optional)</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={middleName}
                  onChange={e => setMiddleName(e.target.value)}
                  placeholder="M."
                  className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid gap-1 mt-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Vance"
                  className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
          {/* Email */}
          <div className="grid gap-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="email"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                placeholder="alice@everest.ai"
                className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
          {/* Country code + phone (same row) */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Country Code</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  placeholder="+1"
                  className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={signupPhone}
                  onChange={e => setSignupPhone(e.target.value)}
                  placeholder="+1 (555) 019‑9021"
                  className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
          {/* Password */}
          <div className="grid gap-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Onboarding Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="password"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                placeholder="Create secure password"
                className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-10 font-semibold mt-3">
            Complete Onboarding
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
