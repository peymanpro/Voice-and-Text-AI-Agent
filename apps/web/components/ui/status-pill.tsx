import React from "react";

type StatusTone = "neutral" | "success" | "warning";

type StatusPillProps = {
  children: React.ReactNode;
  tone?: StatusTone;
};

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return (
    <span className={`status-pill status-pill-${tone}`}>
      <span className="status-pill-dot" aria-hidden="true" />
      {children}
    </span>
  );
}
