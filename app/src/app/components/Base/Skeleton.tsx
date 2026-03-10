import { cn } from "../../../lib/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props}>
    <span className="sr-only">Loading...</span>
  </div>;
}

export { Skeleton };
