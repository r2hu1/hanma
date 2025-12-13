import { motion, type SVGMotionProps } from 'motion/react';

interface LogoProps extends SVGMotionProps<SVGSVGElement> {
  size?: number | string;
}
  
const Logo = ({ className, size = 32, ...props }: LogoProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {/* Stroke Path (Draw Animation) */}
      <motion.path 
        d="M20 15 L40 15 L40 42 L60 42 L60 15 L80 15 L80 85 L60 85 L60 58 L40 58 L40 85 L20 85 Z" 
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { 
            pathLength: 1, 
            opacity: 1,
            transition: { 
              pathLength: { duration: 1.5, ease: "easeInOut" },
              opacity: { duration: 0.1 }
            }
          }
        }}
      />
      {/* Fill Path (Fade In) */}
      <motion.path 
        d="M20 15 L40 15 L40 42 L60 42 L60 15 L80 15 L80 85 L60 85 L60 58 L40 58 L40 85 L20 85 Z" 
        stroke="none"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1, 
            transition: { delay: 1.5, duration: 0.5 } 
          }
        }}
      />
      
      {/* Accent - Hidden for now */}
      <motion.path 
        d="M30 50 L70 50" 
        stroke="currentColor" 
        strokeWidth="0" 
        className="hidden" 
      /> 
      {/* Geometric accents for "Hanma" style */}
      <motion.path 
        d="M15 10 L45 10 L45 40 L55 40 L55 10 L85 10 L90 15 L90 85 L85 90 L55 90 L55 60 L45 60 L45 90 L15 90 L10 85 L10 15 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="0" 
      />
    </motion.svg>
  );
};

export default Logo;
