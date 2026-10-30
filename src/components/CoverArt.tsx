import type { ReactNode } from "react";
import { coverStyle } from "./coverStyle";

export function CoverArt({
  hue,
  seed = 0,
  className = "",
  children,
}: {
  hue: number;
  seed?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`grain overflow-hidden ${className}`} style={coverStyle(hue, seed)}>
      {children}
    </div>
  );
}
