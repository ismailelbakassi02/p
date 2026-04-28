// Central icon registry — maps string names to lucide-react SVG components.
// Usage: <Icon name="Lock" size={16} />  strokeWidth defaults to 1.75 for premium look.
import * as LucideIcons from "lucide-react";

export default function Icon({ name, size = 16, strokeWidth = 1.75, color, style, className }) {
  const Comp = LucideIcons[name];
  if (!Comp) return null;
  return <Comp size={size} strokeWidth={strokeWidth} color={color} style={style} className={className} />;
}
