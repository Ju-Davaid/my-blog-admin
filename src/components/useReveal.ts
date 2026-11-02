import { useReducedMotion } from "motion/react";

/** 入场动画起始态 / 结束态 / 视口配置 */
/* 不用 scale：缩放会让文字亚像素重绘，观感发抖 */
export const REVEAL_FROM = { opacity: 0, y: 14 };
export const REVEAL_TO = { opacity: 1, y: 0 };
export const REVEAL_VIEWPORT = { once: true, margin: "0px 0px -40px 0px" };

/**
 * 丝滑入场：tween + easeOutExpo。
 * 起步快、收尾极缓，无任何过冲回弹（bounce/spring 的 overshoot 就是"抖"的来源）。
 */
export const revealTransition = (delay = 0) =>
  ({
    type: "tween",
    duration: 0.55,
    ease: [0.16, 1, 0.3, 1],
    delay: Math.min(delay, 6) * 0.05,
  }) as const;

/**
 * 生成入场动画 props；delay 为错峰序号（0 起）。
 * · 不传 delay → 不做入场动画
 * · 用户开启「减少动效」→ 返回空对象
 */
export function useReveal(delay?: number) {
  const reduce = useReducedMotion();
  if (reduce || delay === undefined) return {};
  return {
    initial: REVEAL_FROM,
    whileInView: REVEAL_TO,
    viewport: REVEAL_VIEWPORT,
    transition: revealTransition(delay),
  };
}
