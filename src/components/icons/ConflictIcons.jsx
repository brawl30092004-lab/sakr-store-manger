import React from 'react';

/**
 * Modern Vector Icons for Conflict Resolution Dialog
 * Replaces emoji icons with professional SVG vectors
 */

// Warning/Alert Icon
export const WarningIcon = ({ size = 64, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 2L2 20h20L12 2z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="rgba(255, 193, 7, 0.2)"
    />
    <path 
      d="M12 9v4M12 17h.01" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);

// Local Version Icon (Computer/Laptop)
export const LocalIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect 
      x="2" 
      y="3" 
      width="20" 
      height="14" 
      rx="2" 
      stroke="currentColor" 
      strokeWidth="1.5"
      fill="rgba(33, 150, 243, 0.15)"
    />
    <path 
      d="M8 21h8M12 17v4" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <circle 
      cx="12" 
      cy="10" 
      r="2" 
      fill="currentColor"
    />
  </svg>
);

// Remote/Cloud Icon
export const RemoteIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="rgba(76, 175, 80, 0.15)"
    />
  </svg>
);

// Merge Icon (Two arrows merging)
export const MergeIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle 
      cx="5" 
      cy="6" 
      r="3" 
      stroke="currentColor" 
      strokeWidth="1.5"
      fill="rgba(156, 39, 176, 0.2)"
    />
    <circle 
      cx="5" 
      cy="18" 
      r="3" 
      stroke="currentColor" 
      strokeWidth="1.5"
      fill="rgba(156, 39, 176, 0.2)"
    />
    <circle 
      cx="19" 
      cy="12" 
      r="3" 
      stroke="currentColor" 
      strokeWidth="1.5"
      fill="rgba(156, 39, 176, 0.2)"
    />
    <path 
      d="M5 9v6M13.2 13.5L7.8 16.5M13.2 10.5L7.8 7.5" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
  </svg>
);

// Cancel/Close Icon
export const CancelIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="1.5"
      fill="rgba(117, 117, 117, 0.15)"
    />
    <path 
      d="M15 9l-6 6M9 9l6 6" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);

// Product Box Icon
export const ProductIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="rgba(255, 152, 0, 0.15)"
    />
    <polyline 
      points="3.27 6.96 12 12.01 20.73 6.96" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <line 
      x1="12" 
      y1="22.08" 
      x2="12" 
      y2="12" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// File Icon
export const FileIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="rgba(100, 181, 246, 0.15)"
    />
    <polyline 
      points="14 2 14 8 20 8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Info/Tip Icon
export const InfoIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="1.5"
      fill="rgba(255, 193, 7, 0.15)"
    />
    <path 
      d="M12 16v-4M12 8h.01" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);

// Checkmark Icon
export const CheckIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M20 6L9 17l-5-5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Target/Advanced Icon
export const AdvancedIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="6" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="2" 
      fill="currentColor"
    />
  </svg>
);

// Sparkle/Recommended Icon
export const SparkleIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" 
      fill="currentColor"
      stroke="currentColor" 
      strokeWidth="0.5"
    />
  </svg>
);

// Loading Spinner Icon
export const SpinnerIcon = ({ size = 40, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`spinner-icon ${className}`}
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="rgba(255, 255, 255, 0.1)" 
      strokeWidth="3"
    />
    <path 
      d="M12 2a10 10 0 0110 10" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round"
    />
  </svg>
);
