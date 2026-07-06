import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Container className="py-12">
      <Skeleton className="h-9 w-52" />
      <Skeleton className="mt-3 h-5 w-full max-w-lg" />
      <Skeleton className="mt-6 h-20 w-full rounded-xl" />
      <div className="mt-6 space-y-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </Container>
  );
}
