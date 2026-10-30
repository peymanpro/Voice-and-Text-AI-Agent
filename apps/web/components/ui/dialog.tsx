"use client";

import React, { useEffect, useId, useRef } from "react";
import { Button } from "./button";

type DialogProps = {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, title, onOpenChange, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-labelledby={titleId}
      className="ui-dialog"
      onCancel={() => onOpenChange(false)}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
      ref={dialogRef}
    >
      <div className="ui-dialog-panel">
        <header className="ui-dialog-header">
          <h2 id={titleId}>{title}</h2>
          <Button
            aria-label="Close dialog"
            onClick={() => onOpenChange(false)}
            size="sm"
            variant="ghost"
          >
            ×
          </Button>
        </header>
        <div className="ui-dialog-content">{children}</div>
      </div>
    </dialog>
  );
}
