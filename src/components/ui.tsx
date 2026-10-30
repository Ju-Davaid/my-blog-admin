import type {InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes} from "react";
import {Button as AntButton, Modal as AntModal, Tag, Input, Empty} from "antd";
import {
  InboxOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type {LucideIcon} from "lucide-react";

/* ---------- Button（保持原 API） ---------- */

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: LucideIcon;
}

export function Button({variant = "primary", icon: Icon, className = "", children, disabled, ...rest}: ButtonProps) {
  const typeMap: Record<ButtonVariant, "primary" | "default" | "text" | "primary"> = {
    primary: "primary",
    outline: "default",
    ghost: "text",
    danger: "primary",
  };
  return (
    <span className={`inline-flex ${className}`}>
      <AntButton
        type={typeMap[variant]}
        danger={variant === "danger"}
        disabled={disabled}
        icon={Icon ? <Icon size={14} strokeWidth={2.2} /> : undefined}
        style={{minHeight: 34, paddingInline: variant === "ghost" ? 8 : 16}}
        {...(rest as object)}
      >
        {children}
      </AntButton>
    </span>
  );
}

export function IconButton({
  icon: Icon,
  label,
  danger,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {icon: LucideIcon; label: string; danger?: boolean}) {
  return (
    <AntButton
      aria-label={label}
      title={label}
      danger={danger}
      type="text"
      className={className}
      icon={<Icon size={14} strokeWidth={2} />}
      style={{width: 28, height: 28, minWidth: 28, padding: 0}}
      {...(rest as object)}
    />
  );
}

/* ---------- 表单（antd Input 封装，保持原 API） ---------- */

export function Field({label, children, hint}: {label: string; children: ReactNode; hint?: string}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-fog">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ash">{hint}</span>}
    </label>
  );
}

export function TextInput({className = "", ...rest}: InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...(rest as object)} className={className} />;
}

export function TextArea({className = "", ...rest}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <Input.TextArea {...(rest as object)} className={className} />;
}

export function Select({className = "", children, ...rest}: SelectHTMLAttributes<HTMLSelectElement>) {
  // 不传宽度时默认 w-full；传了 w-* 则以传入为准（Tailwind 同属性冲突时后写的 class 覆盖）
  const hasWidth = /\bw-(?:\d+|full|auto|min|max|fit|screen|svw|lvw|dvw|\[)/.test(className);
  return (
    <select
      className={`${hasWidth ? "" : "w-full"} cursor-pointer rounded-md border border-line bg-surface px-2.5 py-1.5 text-[13px] text-cream transition-colors hover:border-[#409eff] focus:border-[#409eff] focus:outline-none ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

/* ---------- 徽章与状态 ---------- */

const badgeColors = {
  ember: "#409eff",
  moss: "#67c23a",
  gold: "#e6a23c",
  ruby: "#f56c6c",
  haze: "#409eff",
  neutral: "#8f959e",
} as const;

export type BadgeTone = keyof typeof badgeColors;

export function Badge({tone = "neutral", children}: {tone?: BadgeTone; children: ReactNode}) {
  return (
    <Tag color={badgeColors[tone]} variant="filled" style={{margin: 0, fontSize: 12}}>
      {children}
    </Tag>
  );
}

const dotColors: Record<string, string> = {
  moss: "#67c23a",
  gold: "#e6a23c",
  ruby: "#f56c6c",
  ember: "#409eff",
  haze: "#409eff",
};

export function StatusDot({color, pulse}: {color: keyof typeof dotColors; pulse?: boolean}) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{background: dotColors[color]}}
        />
      )}
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{background: dotColors[color]}} />
    </span>
  );
}

/* ---------- 弹窗（antd Modal） ---------- */

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <AntModal
      open={open}
      title={title}
      onCancel={onClose}
      footer={null}
      width={440}
      destroyOnHidden
      closeIcon={<CloseOutlined />}
    >
      {children}
    </AntModal>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmText = "确认",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AntModal
      open={open}
      title={title}
      onCancel={onCancel}
      width={400}
      okText={confirmText}
      cancelText="取消"
      onOk={onConfirm}
      okButtonProps={{danger: true}}
    >
      <p className="text-[13px] leading-relaxed text-fog">{body}</p>
    </AntModal>
  );
}

/* ---------- 空状态 ---------- */

export function EmptyState({
  icon: _icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  void _icon;
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line-strong bg-surface py-12 text-center">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <>
            <p className="text-[13px] font-medium text-cream">{title}</p>
            {hint && <p className="mx-auto max-w-72 text-xs leading-relaxed text-ash">{hint}</p>}
          </>
        }
      >
        {action}
      </Empty>
      <InboxOutlined className="hidden" />
    </div>
  );
}

/* ---------- 卡片 ---------- */

export function Card({children, className = ""}: {children: ReactNode; className?: string}) {
  return (
    <div className={`rounded-lg border border-line bg-surface card-shadow ${className}`}>{children}</div>
  );
}

export function CardHeader({
  title,
  extra,
  className = "",
}: {
  title: string;
  extra?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between border-b border-line px-5 py-3 ${className}`}>
      <h3 className="text-[13px] font-semibold text-cream">{title}</h3>
      {extra}
    </div>
  );
}
