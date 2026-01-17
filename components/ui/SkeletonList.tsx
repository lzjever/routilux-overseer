"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonListProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

export function SkeletonList({ count = 3, className, itemClassName }: SkeletonListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className={itemClassName}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
