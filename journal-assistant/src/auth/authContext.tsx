import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, PaperProject, PROFILE_STATE_PREFIX, PROFILES_LIST_KEY, DEFAULT_STATE } from '../types';

interface AuthContextProps {
  user: string | null;
  project: PaperProject | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginDirectly: (username: string, project: PaperProject) => void;
  logout: () => void;
  signup: (partial: Partial<UserProfile>) => Promise<void>;
  activate: (activationKey: string) => Promise<void>;
  socialSignIn: (name: string, email: string, provider: 'google' | 'facebook') => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  setProject: React.Dispatch<React.SetStateAction<PaperProject | null>>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [project, setProject] = useState<PaperProject | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize from localStorage if available
  useEffect(() => {
    const storedUser = localStorage.getItem('phd_active_session_username');
    if (storedUser) {
      const stateStr = localStorage.getItem(`phd_profile_state_${storedUser}`);
      if (stateStr) {
        try {
          const profile = JSON.parse(stateStr) as UserProfile;
          setUser(storedUser);
          setProject(profile.projectState);
        } catch (e) {
          console.error('Failed to parse stored profile', e);
        }
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    const key = `${PROFILE_STATE_PREFIX}${username}`;
    const saved = localStorage.getItem(key);
    if (!saved) throw new Error('User not found');
    const profile = JSON.parse(saved) as UserProfile;
    if (profile.passcodeHash !== password) throw new Error('Incorrect password');
    if (profile.status === 'pending') throw new Error('Profile pending activation');
    setUser(username);
    setProject(profile.projectState);
    localStorage.setItem('phd_active_session_username', username);
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setProject(null);
    localStorage.removeItem('phd_active_session_username');
  };

  const signup = async (partial: Partial<UserProfile>) => {
    const username = partial.username?.trim();
    if (!username) throw new Error('Username required');
    const key = `${PROFILE_STATE_PREFIX}${username}`;
    const pending: UserProfile = {
      username,
      passcodeHash: partial.passcodeHash || '',
      projectState: partial.projectState as PaperProject,
      fullName: partial.fullName || '',
      email: partial.email || '',
      phone: partial.phone || '',
      affiliation: partial.affiliation || '',
      authenticId: partial.authenticId || '',
      status: 'pending',
      activationKeyHash: ''
    } as UserProfile;
    localStorage.setItem(key, JSON.stringify(pending));
    const listStr = localStorage.getItem(PROFILES_LIST_KEY);
    let list: string[] = [];
    if (listStr) {
      try { list = JSON.parse(listStr).profilesList || []; } catch (_) {}
    }
    if (!list.includes(username)) {
      list.push(username);
      localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify({ profilesList: list }));
    }
  };

  const activate = async (activationKey: string) => {
    if (!user) throw new Error('No active user');
    const key = `${PROFILE_STATE_PREFIX}${user}`;
    const saved = localStorage.getItem(key);
    if (!saved) throw new Error('Profile not found');
    const profile = JSON.parse(saved) as UserProfile;
    profile.status = 'approved';
    localStorage.setItem(key, JSON.stringify(profile));
    setProject(profile.projectState);
  };

  const socialSignIn = async (name: string, email: string, provider: 'google' | 'facebook') => {
    const username = name.trim();
    const stateKey = `${PROFILE_STATE_PREFIX}${username}`;
    const savedStateStr = localStorage.getItem(stateKey);
    let targetProjectState: PaperProject;
    if (savedStateStr) {
      try { targetProjectState = JSON.parse(savedStateStr).projectState; }
      catch { targetProjectState = DEFAULT_STATE(username); }
    } else {
      targetProjectState = DEFAULT_STATE(username);
      targetProjectState.authorDetails = `${username}, PhD Scholar (${provider === 'google' ? 'Google' : 'Facebook'} Verified)`;
      const newProfile: UserProfile = {
        username,
        passcodeHash: `social_${provider}_auth_passcode`,
        projectState: targetProjectState,
        fullName: username,
        email,
        status: 'approved'
      } as UserProfile;
      localStorage.setItem(stateKey, JSON.stringify(newProfile));
      const savedList = localStorage.getItem(PROFILES_LIST_KEY);
      let list: string[] = [];
      if (savedList) {
        try { list = JSON.parse(savedList).profilesList || []; } catch (_) {}
      }
      if (!list.includes(username)) { list.push(username); localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify({ profilesList: list })); }
    }
    setUser(username);
    setProject(targetProjectState);
    localStorage.setItem('phd_active_session_username', username);
  };

  const loginDirectly = (username: string, projectState: PaperProject) => {
    setUser(username);
    setProject(projectState);
    localStorage.setItem('phd_active_session_username', username);
  };

  const sendOtp = async (phone: string) => { console.log('Sending OTP to', phone); };
  const verifyOtp = async (code: string) => { console.log('Verifying OTP code', code); };

  return (
    <AuthContext.Provider value={{
      user,
      project,
      loading,
      login,
      loginDirectly,
      logout,
      signup,
      activate,
      socialSignIn,
      sendOtp,
      verifyOtp,
      setProject
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
