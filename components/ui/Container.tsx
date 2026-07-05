import { cn } from "@/lib/utils";

/** Centered page container with a comfortable reading measure and gutters. */
export function Container({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  const max =
    size === "wide"
      ? "max-w-6xl"
      : size === "narrow"
        ? "max-w-2xl"
        : "max-w-5xl";
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6", max, className)}>
      {children}
    </div>
  );
}
