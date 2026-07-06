import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Container size="narrow" className="py-12">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-10 w-full max-w-lg" />
      <Skeleton className="mt-3 h-5 w-full max-w-md" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </Container>
  );
}
