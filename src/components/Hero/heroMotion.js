export const heroEase = [0.22, 1, 0.36, 1];

export function revealItem(reduced) {
  return {
    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.6, ease: heroEase },
    },
  };
}
