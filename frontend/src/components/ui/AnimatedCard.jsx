/*
 * AnimatedCard – glass morphism card with hover lift + glow.
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
      whileHover={hover ? { y: -4, boxShadow: '0 0 30px rgba(99,102,241,0.15)' } : undefined}
      onClick={onClick}
      className={`glass rounded-2xl p-6 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
