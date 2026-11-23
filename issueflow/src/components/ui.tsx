import { cn } from "@/lib/ui";
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "subtle" }) {
  const styles = {
    primary: "bg-accent text-white hover:bg-accent-2",
    ghost: "border border-line bg-transparent text-ink hover:bg-panel-2",
    danger: "bg-danger/15 text-danger hover:bg-danger/25",
    subtle: "bg-panel-2 text-ink hover:bg-line",
  }[variant];
  return (
    <button
      className={cn("inline-flex h-9 items-center justify-center gap-2 rounded-[10px] px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50", styles, className)}
      {...props}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("h-10 w-full rounded-[10px] border border-line bg-canvas px-3 text-sm outline-none placeholder:text-faint", props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("min-h-28 w-full rounded-[10px] border border-line bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("h-10 w-full rounded-[10px] border border-line bg-canvas px-3 text-sm outline-none", props.className)} />;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "critical" | "high" | "medium" | "low" | "ok" | "warn" }) {
  const tones = {
    neutral: "bg-panel-2 text-muted",
    critical: "bg-danger/15 text-danger",
    high: "bg-warn/15 text-warn",
    medium: "bg-accent/15 text-accent-2",
    low: "bg-panel-2 text-faint",
    ok: "bg-ok/15 text-ok",
    warn: "bg-warn/15 text-warn",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}
