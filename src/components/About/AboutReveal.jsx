import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const elements = { section: motion.section, div: motion.div, article: motion.article, li: motion.li };
export default function AboutReveal({ as = 'section', delay = 0, children, ...props }) {
  const reduced = useReducedMotion();
  const [hiddenY, setHiddenY] = useState(24);
  const Element = elements[as] ?? motion.section;
  const canObserve = typeof window !== 'undefined' && 'IntersectionObserver' in window;
  const visible = { opacity: 1, y: 0, filter: 'blur(0px)' };
  const hidden = { opacity: 0, y: hiddenY, filter: 'blur(8px)' };
  const animated = canObserve && !reduced;

  return (
    <Element
      {...props}
      initial={animated ? hidden : false}
      animate={animated ? hidden : visible}
      whileInView={canObserve ? visible : undefined}
      viewport={{ once: false, amount: .12, margin: '-10% 0px -6% 0px' }}
      onViewportLeave={canObserve ? entry => {
        if (animated && entry) {
          setHiddenY(entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0) ? -24 : 24);
        }
      } : undefined}
      transition={{
        duration: animated ? .5 : 0,
        delay: animated ? Math.min(delay, .15) : 0,
        ease: [.22, 1, .36, 1],
      }}
    >
      {children}
    </Element>
  );
}
