import type { CSSProperties } from "react";

/* 由色相确定性生成「胶片感」渐变封面/照片底图 */

export function coverStyle(hue: number, seed = 0): CSSProperties {
  const h1 = hue % 360;
  const h2 = (hue + 42) % 360;
  const ax = 15 + ((seed * 37) % 55);
  const ay = 10 + ((seed * 23) % 35);
  return {
    background: [
      `radial-gradient(115% 85% at ${ax}% ${ay}%, hsl(${h1} 62% 40% / 0.9), transparent 62%)`,
      `radial-gradient(95% 120% at ${95 - ax / 2}% ${92 - ay / 2}%, hsl(${h2} 68% 28% / 0.85), transparent 66%)`,
      `linear-gradient(158deg, hsl(${h1} 28% 15%), hsl(${h2} 24% 8%))`,
    ].join(","),
  };
}
