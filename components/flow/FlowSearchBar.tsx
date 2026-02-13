"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMemo, useEffect, useState } from "react";
import { debounce } from "@/lib/utils/debounce";

interface FlowSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  testId?: string;
}

export function FlowSearchBar({
  value,
  onChange,
  placeholder = "Search flows...",
  className,
  testId,
}: FlowSearchBarProps) {
  const debouncedOnChange = useMemo(() => debounce(onChange, 200), [onChange]);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  return (
    <div className={cn("relative", className)} data-testid={testId}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
        data-testid={testId ? `${testId}-input` : undefined}
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={() => {
            setLocalValue("");
            onChange("");
          }}
          data-testid={testId ? `${testId}-clear` : undefined}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
