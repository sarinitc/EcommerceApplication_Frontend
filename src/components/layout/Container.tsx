import type { HTMLAttributes } from "react";

export function Container(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}