import { PropsWithChildren } from "react";
import type React from "react";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <section className={`rounded-2xl border border-white/10 bg-panel p-4 shadow-glow ${className}`}>{children}</section>;
}

export function StatCard({ label, value, tone = "mint" }: { label: string; value: string | number; tone?: "mint" | "peach" | "sky" | "berry" }) {
  const tones = {
    mint: "text-mint",
    peach: "text-peach",
    sky: "text-skysoft",
    berry: "text-berry"
  };
  return (
    <Card>
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
    </Card>
  );
}

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return (
    <button
      className={`rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        variant === "primary" ? "bg-mint text-ink hover:bg-mint/90" : "bg-white/10 text-slate-100 hover:bg-white/20"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-mint/70"
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-mint/70"
      {...props}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="w-full rounded-xl border border-white/10 bg-panelSoft px-4 py-3 text-sm text-white outline-none transition focus:border-mint/70"
      {...props}
    />
  );
}
