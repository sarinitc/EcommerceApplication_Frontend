import type { DialogHTMLAttributes } from "react";

export function Modal(props: DialogHTMLAttributes<HTMLDialogElement>) {
  return <dialog {...props} />;
}