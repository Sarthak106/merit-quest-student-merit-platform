/*
 * AnimatedCard – clean card with hover lift + subtle shadow.
 */
import { motion } from 'framer-motion';

export default function AnimatedCard({
  children,
  className = '',
  delay = 0,
  onClick,
  hover = true,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -4, boxShadow: '0 8px 24px rgba(67,56,202,0.08)' } : undefined}
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-6 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
