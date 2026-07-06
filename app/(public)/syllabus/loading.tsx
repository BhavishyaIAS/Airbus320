import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Container className="py-12">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-full max-w-md" />
      <div className="mt-10 space-y-8">
        {[0, 1].map((i) => (
          <div key={i}>
            <Skeleton className="h-7 w-64" />
            <div className="mt-4 space-y-2 pl-6">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-5 w-60" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
