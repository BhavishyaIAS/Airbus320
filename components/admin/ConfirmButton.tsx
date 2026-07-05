"use client";

import { cn } from "@/lib/utils";

/**
 * Submit button that asks for confirmation before allowing the enclosing
 * <form action={serverAction}> to submit. Use for destructive actions.
 */
export function ConfirmButton({
  message,
  children,
  className,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={cn("text-danger hover:underline", className)}
    >
      {children}
    </button>
  );
}
