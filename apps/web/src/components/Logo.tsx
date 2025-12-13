import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const Logo = ({ className, size = 32, ...props }: LogoProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      {/* Stroke Path (Draw Animation) */}
      <path 
        d="M20 15 L40 15 L40 42 L60 42 L60 15 L80 15 L80 85 L60 85 L60 58 L40 58 L40 85 L20 85 Z" 
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
        className="animate-logo-path"
      />
      {/* Fill Path (Fade In) */}
      <path 
        d="M20 15 L40 15 L40 42 L60 42 L60 15 L80 15 L80 85 L60 85 L60 58 L40 58 L40 85 L20 85 Z" 
        className="animate-logo-fill"
      />
      
      {/* Accent - Hidden for now or can be animated too */}
      <path 
        d="M30 50 L70 50" 
        stroke="currentColor" 
        strokeWidth="0" 
        className="hidden" 
      /> 
      {/* Geometric accents for "Hanma" style - slightly sharper edges */}
      <path d="M15 10 L45 10 L45 40 L55 40 L55 10 L85 10 L90 15 L90 85 L85 90 L55 90 L55 60 L45 60 L45 90 L15 90 L10 85 L10 15 Z" fill="none" stroke="currentColor" strokeWidth="0" />
    </svg>
  );
};

export default Logo;
