"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background gradient circle */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>

        {/* Main circular background */}
        <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" />

        {/* Flow nodes - representing workflow routing */}
        {/* Center node */}
        <circle cx="24" cy="24" r="6" fill="white" opacity="0.95" />
        <circle cx="24" cy="24" r="4" fill="url(#nodeGradient)" />

        {/* Top node */}
        <circle cx="24" cy="10" r="4" fill="white" opacity="0.9" />
        <circle cx="24" cy="10" r="2.5" fill="url(#nodeGradient)" />

        {/* Bottom left node */}
        <circle cx="12" cy="34" r="4" fill="white" opacity="0.9" />
        <circle cx="12" cy="34" r="2.5" fill="url(#nodeGradient)" />

        {/* Bottom right node */}
        <circle cx="36" cy="34" r="4" fill="white" opacity="0.9" />
        <circle cx="36" cy="34" r="2.5" fill="url(#nodeGradient)" />

        {/* Connection lines */}
        <path
          d="M24 14 L24 20"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M20 26 L14 32"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M28 26 L34 32"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Animated pulse ring (optional CSS animation can be applied) */}
        <circle cx="24" cy="24" r="18" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
      </svg>

      {showText && (
        <span
          className={cn(
            "font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-300 dark:to-blue-400",
            text
          )}
        >
          Routilux Overseer
        </span>
      )}
    </div>
  );
}

// Standalone SVG icon for use in favicons etc.
export function LogoIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="nodeGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>

      <circle cx="24" cy="24" r="22" fill="url(#logoGradientIcon)" />

      <circle cx="24" cy="24" r="6" fill="white" opacity="0.95" />
      <circle cx="24" cy="24" r="4" fill="url(#nodeGradientIcon)" />

      <circle cx="24" cy="10" r="4" fill="white" opacity="0.9" />
      <circle cx="24" cy="10" r="2.5" fill="url(#nodeGradientIcon)" />

      <circle cx="12" cy="34" r="4" fill="white" opacity="0.9" />
      <circle cx="12" cy="34" r="2.5" fill="url(#nodeGradientIcon)" />

      <circle cx="36" cy="34" r="4" fill="white" opacity="0.9" />
      <circle cx="36" cy="34" r="2.5" fill="url(#nodeGradientIcon)" />

      <path d="M24 14 L24 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M20 26 L14 32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M28 26 L34 32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

      <circle cx="24" cy="24" r="18" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}
