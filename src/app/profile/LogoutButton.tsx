"use client";

import { useEffect, useRef, useState } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { logout } from "./actions";

export function LogoutButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    cancelButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);

      if (event.key === "Tab" && dialogRef.current) {
        const focusableElements = Array.from(
          dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not([disabled])"),
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements.at(-1);

        if (!firstElement || !lastElement) return;
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  async function handleLogout() {
    setIsPending(true);
    await logout();
  }

  return (
    <>
      <button className="profile-logout-button" type="button" onClick={() => setIsOpen(true)}>
        <LogoutOutlinedIcon aria-hidden="true" />
        Log out
      </button>

      {isOpen && (
        <div className="logout-modal-backdrop" role="presentation" onMouseDown={() => !isPending && setIsOpen(false)}>
          <section ref={dialogRef} className="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title" aria-describedby="logout-dialog-description" onMouseDown={(event) => event.stopPropagation()}>
            <button className="logout-modal-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close logout dialog" disabled={isPending}><CloseOutlinedIcon aria-hidden="true" /></button>
            <span className="logout-modal-icon" aria-hidden="true"><WarningAmberRoundedIcon /></span>
            <h2 id="logout-dialog-title">Log out?</h2>
            <p id="logout-dialog-description">Are you sure you want to log out? You will need to sign in again to access your orders and profile.</p>
            <div className="logout-modal-actions">
              <button ref={cancelButtonRef} type="button" onClick={() => setIsOpen(false)} disabled={isPending}>Cancel</button>
              <button type="button" onClick={handleLogout} disabled={isPending}>{isPending ? "Logging out..." : "Log out"}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
