import React, { type HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  shape?: "text" | "rectangular" | "circular";
  width?: string;
  height?: string;
};

export function Skeleton({
  shape = "text",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={["ui-skeleton", `ui-skeleton-${shape}`, className]
        .filter(Boolean)
        .join(" ")}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}
