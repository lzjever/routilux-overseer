import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterStatus = "all" | "enabled" | "disabled" | "builtin" | "user";

interface PluginFiltersProps {
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: FilterStatus) => void;
}

export function PluginFilters({ onSearchChange, onStatusFilterChange }: PluginFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search plugins..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Select
        defaultValue="all"
        onValueChange={(value) => onStatusFilterChange(value as FilterStatus)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Plugins</SelectItem>
          <SelectItem value="enabled">Enabled</SelectItem>
          <SelectItem value="disabled">Disabled</SelectItem>
          <SelectItem value="builtin">Built-in</SelectItem>
          <SelectItem value="user">User Plugins</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
