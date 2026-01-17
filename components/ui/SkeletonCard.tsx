"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  lines?: number;
}

export function SkeletonCard({ className, showHeader = true, lines = 3 }: SkeletonCardProps) {
  return (
    <Card className={cn(className)}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
