import React, { ReactNode } from "react";

export interface AuthCardProps {
  children: ReactNode;
  title?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-light)] p-4">
      <div className="w-full max-w-md space-y-6 rounded-[var(--radius-card)] bg-[rgba(255,255,255,0.08)] p-8 backdrop-blur-[12px] shadow-[var(--shadow-elevated)] glass-card">
        {title && <h2 className="text-center text-2xl font-semibold text-white mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};
