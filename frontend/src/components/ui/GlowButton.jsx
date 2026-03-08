/*
 * GlowButton – gradient button with glow shadow.
 */
import { motion } from 'framer-motion';

export default function GlowButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary | accent | ghost
  size = 'md',         // sm | md | lg
  disabled = false,
  className = '',
  icon: Icon,
  loading = false,
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-glow-sm hover:shadow-glow',
    accent: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]',
    ghost: 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </motion.button>
  );
}
