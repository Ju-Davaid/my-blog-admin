import { createElement } from "react";
import type {
  ComponentType,
  CSSProperties,
  FormEventHandler,
  MouseEventHandler,
  ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  REVEAL_FROM,
  REVEAL_TO,
  REVEAL_VIEWPORT,
  revealTransition,
} from "./useReveal";

/* 支持的宿主标签：保持调用方原本的 DOM 结构，避免栅格/列表层级被改变 */
const TAGS = {
  div: motion.div,
  figure: motion.figure,
  form: motion.form,
  li: motion.li,
  ul: motion.ul,
  p: motion.p,
  section: motion.section,
} as const;

type RevealTag = keyof typeof TAGS;

/**
 * 入场动画容器 —— 替代原来的 .reveal / .reveal-N CSS 动画。
 * 渲染的仍是同一个标签，只额外接管 opacity / transform，不改 DOM 层级。
 */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  className = "",
  style,
  onClick,
  onSubmit,
}: {
  children?: ReactNode;
  /** 错峰序号，0 起 */
  delay?: number;
  as?: RevealTag;
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLElement>;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}) {
  const reduce = useReducedMotion();
  /* 统一成宽松组件类型：不同标签的事件签名不同，约束交给外层 props */
  const Tag = TAGS[as] as ComponentType<Record<string, unknown>>;
  const passThrough = { className, style, onClick, onSubmit };

  if (reduce) {
    return createElement(as, passThrough, children);
  }

  return (
    <Tag
      {...passThrough}
      initial={REVEAL_FROM}
      whileInView={REVEAL_TO}
      viewport={REVEAL_VIEWPORT}
      transition={revealTransition(delay)}
    >
      {children}
    </Tag>
  );
}
