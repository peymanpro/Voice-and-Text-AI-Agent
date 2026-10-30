import React, { type HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "sm" | "md" | "lg";
};

export function Card({
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={["ui-card", `ui-card-${padding}`, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
