import { BadgeCheck, Layers3, MessageCircle, PackageCheck, Ruler, Scissors, Settings2, Sparkles } from 'lucide-react';

const icons = { layers: Layers3, ruler: Ruler, scissors: Scissors, sparkles: Sparkles, check: BadgeCheck, package: PackageCheck, message: MessageCircle, settings: Settings2 };
export default function AboutIcon({ name, ...props }) {
  const Icon = icons[name] ?? Layers3;
  return <Icon {...props} aria-hidden="true" />;
}
