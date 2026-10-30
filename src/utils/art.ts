/**
 * 生成一张渐变 SVG 作为「占位图 / 演示配图」。
 * 用 dataURL 而不是 CSS 渐变，是因为它必须是真实图片源，
 * 这样 antd Image 的懒加载与放大预览才能作用在它身上。
 */

const cache = new Map<string, string>();

function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  return h;
}

export function gradientSrc(seed: string, w = 800, h = 600): string {
  const key = `${seed}|${w}x${h}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const h1 = hashHue(seed);
  const h2 = (h1 + 52) % 360;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${h1} 34% 42%)"/>` +
    `<stop offset="0.55" stop-color="hsl(${h2} 28% 26%)"/>` +
    `<stop offset="1" stop-color="hsl(${h1} 42% 15%)"/>` +
    `</linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    `<circle cx="${Math.round(w * 0.79)}" cy="${Math.round(h * 0.21)}" r="${Math.round(h * 0.29)}" fill="hsl(${h2} 72% 76%)" opacity="0.16"/>` +
    `<circle cx="${Math.round(w * 0.16)}" cy="${Math.round(h * 0.86)}" r="${Math.round(h * 0.35)}" fill="hsl(${h1} 68% 62%)" opacity="0.12"/>` +
    `</svg>`;

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  cache.set(key, url);
  return url;
}
