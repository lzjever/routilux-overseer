"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAPI } from "@/lib/api";
import { Loader2, Search, Inbox, Send, ChevronDown, ChevronRight } from "lucide-react";
import type { ObjectInfo } from "@/lib/api/generated";
import { cn } from "@/lib/utils";

interface AddRoutineDialogProps {
  flowId: string;
  serverUrl: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

interface RoutineInterface {
  slots?: string[];
  events?: string[];
}

export function AddRoutineDialog({
  flowId,
  serverUrl,
  onSuccess,
  trigger,
}: AddRoutineDialogProps) {
  const [open, setOpen] = useState(false);
  const [routineId, setRoutineId] = useState("");
  const [selectedRoutine, setSelectedRoutine] = useState<ObjectInfo | null>(null);
  const [routines, setRoutines] = useState<ObjectInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [interfaceInfo, setInterfaceInfo] = useState<RoutineInterface | null>(null);
  const [loadingInterface, setLoadingInterface] = useState(false);
  const [showInterface, setShowInterface] = useState(false);
  const [config, setConfig] = useState("");

  // Load routines from factory
  useEffect(() => {
    if (open && serverUrl) {
      setLoadingRoutines(true);
      const loadRoutines = async () => {
        try {
          const api = createAPI(serverUrl);
          const response = await api.factory.listObjects({ objectType: "routine" });
          setRoutines(response.objects || []);
        } catch (err) {
          console.error("Failed to load routines:", err);
          setError(err instanceof Error ? err.message : "Failed to load routines");
        } finally {
          setLoadingRoutines(false);
        }
      };
      loadRoutines();
    }
  }, [open, serverUrl]);

  // Load interface info when routine is selected
  useEffect(() => {
    if (selectedRoutine && serverUrl) {
      setLoadingInterface(true);
      const loadInterface = async () => {
        try {
          const api = createAPI(serverUrl);
          const info = await api.factory.getObjectInterface(selectedRoutine.name);
          setInterfaceInfo({
            slots: info.slots || [],
            events: info.events || [],
          });
        } catch (err) {
          console.error("Failed to load interface:", err);
          setInterfaceInfo(null);
        } finally {
          setLoadingInterface(false);
        }
      };
      loadInterface();
    } else {
      setInterfaceInfo(null);
      setShowInterface(false);
    }
  }, [selectedRoutine, serverUrl]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    routines.forEach((r) => {
      if (r.category) cats.add(r.category);
    });
    return Array.from(cats).sort();
  }, [routines]);

  // Filter routines
  const filteredRoutines = useMemo(() => {
    return routines.filter((routine) => {
      // Filter by category
      if (selectedCategory !== "all" && routine.category !== selectedCategory) {
        return false;
      }
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          routine.name.toLowerCase().includes(query) ||
          routine.description?.toLowerCase().includes(query) ||
          routine.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [routines, selectedCategory, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineId || !selectedRoutine || !serverUrl) return;

    setLoading(true);
    setError(null);
    try {
      const api = createAPI(serverUrl);
      let configObj: Record<string, any> = {};
      if (config.trim()) {
        try {
          configObj = JSON.parse(config);
        } catch {
          setError("Invalid JSON in config field");
          setLoading(false);
          return;
        }
      }
      await api.flows.addRoutine(flowId, {
        routine_id: routineId,
        object_name: selectedRoutine.name, // Use factory name
        config: Object.keys(configObj).length > 0 ? configObj : undefined,
      });
      setOpen(false);
      setRoutineId("");
      setSelectedRoutine(null);
      setConfig("");
      setSearchQuery("");
      setSelectedCategory("all");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add routine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm">Add Routine</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader>
            <DialogTitle>Add Routine to Flow</DialogTitle>
            <DialogDescription>
              Select a routine from the factory to add to this flow.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search routines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Routine List */}
            <div className="flex-1 min-h-0 border rounded-lg">
              {loadingRoutines ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRoutines.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  {searchQuery || selectedCategory !== "all"
                    ? "No routines found matching your filters"
                    : "No routines available"}
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-2 space-y-2">
                    {filteredRoutines.map((routine) => (
                      <button
                        key={routine.name}
                        type="button"
                        onClick={() => setSelectedRoutine(routine)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-colors",
                          selectedRoutine?.name === routine.name
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{routine.name}</span>
                              {routine.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {routine.category}
                                </Badge>
                              )}
                            </div>
                            {routine.description && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {routine.description}
                              </p>
                            )}
                            {routine.tags && routine.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {routine.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {/* Show interface info if available */}
                            {interfaceInfo && selectedRoutine?.name === routine.name && (
                              <div className="mt-2 pt-2 border-t border-border/50">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Inbox className="h-3 w-3 text-blue-500" />
                                    {interfaceInfo.slots?.length || 0} slots
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Send className="h-3 w-3 text-emerald-500" />
                                    {interfaceInfo.events?.length || 0} events
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          {selectedRoutine?.name === routine.name && (
                            <div className="flex-shrink-0">
                              {loadingInterface ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowInterface(!showInterface);
                                  }}
                                >
                                  {showInterface ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        {/* Expanded interface details */}
                        {showInterface &&
                          interfaceInfo &&
                          selectedRoutine?.name === routine.name && (
                            <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
                              {interfaceInfo.slots && interfaceInfo.slots.length > 0 && (
                                <div>
                                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                                    Input Slots:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {interfaceInfo.slots.map((slot) => (
                                      <Badge
                                        key={slot}
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 bg-blue-50 border-blue-200"
                                      >
                                        {slot}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {interfaceInfo.events && interfaceInfo.events.length > 0 && (
                                <div>
                                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                                    Output Events:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {interfaceInfo.events.map((event) => (
                                      <Badge
                                        key={event}
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 bg-emerald-50 border-emerald-200"
                                      >
                                        {event}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Routine ID and Config */}
            {selectedRoutine && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="routineId">Routine ID *</Label>
                  <Input
                    id="routineId"
                    value={routineId}
                    onChange={(e) => setRoutineId(e.target.value)}
                    placeholder="e.g., processor"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier for this routine in the flow
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="config">Config (JSON, optional)</Label>
                  <Textarea
                    id="config"
                    value={config}
                    onChange={(e) => setConfig(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={3}
                  />
                  {selectedRoutine.example_config &&
                    Object.keys(selectedRoutine.example_config).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Example: {JSON.stringify(selectedRoutine.example_config)}
                      </p>
                    )}
                </div>
              </div>
            )}

            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedRoutine || !routineId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Routine
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
