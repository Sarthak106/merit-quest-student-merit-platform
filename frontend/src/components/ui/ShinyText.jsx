/*
 * ShinyText – adapted from reactbits.dev
 * Renders text with a shimmering highlight sweep.
 */
export default function ShinyText({
  children,
  className = '',
  shimmerWidth = 100,
  speed = 3,
  disabled = false,
}) {
  const shimmerStyle = {
    backgroundImage: `linear-gradient(
      120deg,
      rgba(255,255,255,0) 40%,
      rgba(255,255,255,0.8) 50%,
      rgba(255,255,255,0) 60%
    )`,
    backgroundSize: `${shimmerWidth}% 100%`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'rgba(255,255,255,0.7)',
    animation: disabled ? 'none' : `shimmer-slide ${speed}s infinite linear`,
  };

  return (
    <>
      <style>{`
        @keyframes shimmer-slide {
          from { background-position: 200% center; }
          to { background-position: -200% center; }
        }
      `}</style>
      <span className={`inline-block ${className}`} style={shimmerStyle}>
        {children}
      </span>
    </>
  );
}
