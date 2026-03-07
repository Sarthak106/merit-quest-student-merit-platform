/*
 * CountUp – smooth number counter using framer-motion.
 */
import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

export default function CountUp({
  to,
  from = 0,
  duration = 1.5,
  separator = ',',
  decimals = 0,
  className = '',
  prefix = '',
  suffix = '',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' });
  const mv = useMotionValue(from);
  const spring = useSpring(mv, { duration: duration * 1000 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useEffect(() => {
    const unsubscribe = spring.on('change', v => {
      if (ref.current) {
        const num = decimals > 0
          ? v.toFixed(decimals)
          : Math.round(v).toString();
        const formatted = separator
          ? num.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
          : num;
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });
    return unsubscribe;
  }, [spring, separator, decimals, prefix, suffix]);

  return <span ref={ref} className={className}>{prefix}{from}{suffix}</span>;
}
