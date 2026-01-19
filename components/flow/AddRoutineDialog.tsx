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
import { Loader2, Search, Inbox, Send, ChevronDown, ChevronRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import type { ObjectInfo } from "@/lib/api/generated";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

type DialogStep = "select" | "configure";

export function AddRoutineDialog({
  flowId,
  serverUrl,
  onSuccess,
  trigger,
}: AddRoutineDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<DialogStep>("select");
  const [routineId, setRoutineId] = useState("");
  const [selectedRoutine, setSelectedRoutine] = useState<ObjectInfo | null>(null);
  const [routines, setRoutines] = useState<ObjectInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [interfaceInfo, setInterfaceInfo] = useState<RoutineInterface | null>(null);
  const [loadingInterface, setLoadingInterface] = useState(false);
  const [showInterface, setShowInterface] = useState(false);
  const [config, setConfig] = useState("");

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setStep("select");
      setSelectedRoutine(null);
      setRoutineId("");
      setConfig("");
      setSearchQuery("");
      setSelectedCategory("all");
      setShowInterface(false);
      setInterfaceInfo(null);
    }
  }, [open]);

  // Load routines from factory - filter to only get routines, not flows
  useEffect(() => {
    if (open && serverUrl) {
      setLoadingRoutines(true);
      const loadRoutines = async () => {
        try {
          const api = createAPI(serverUrl);
          const response = await api.factory.listObjects({ objectType: "routine" });
          // Double-check: filter to ensure only routines are included
          const routinesOnly = (response.objects || []).filter(
            (obj) => obj.object_type === "routine"
          );
          setRoutines(routinesOnly);
        } catch (err) {
          console.error("Failed to load routines:", err);
          toast.error("Failed to load routines", {
            description: err instanceof Error ? err.message : "Unknown error",
          });
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

  // Handle routine selection and move to configure step
  const handleRoutineSelect = (routine: ObjectInfo) => {
    setSelectedRoutine(routine);
    setRoutineId(routine.name); // Default to routine name
    setStep("configure");
  };

  // Handle back to selection
  const handleBack = () => {
    setStep("select");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineId || !selectedRoutine || !serverUrl) return;

    setLoading(true);
    try {
      const api = createAPI(serverUrl);
      let configObj: Record<string, any> = {};
      if (config.trim()) {
        try {
          configObj = JSON.parse(config);
        } catch {
          toast.error("Invalid JSON", {
            description: "Please check your config JSON format",
          });
          setLoading(false);
          return;
        }
      }
      await api.flows.addRoutine(flowId, {
        routine_id: routineId,
        object_name: selectedRoutine.name,
        config: Object.keys(configObj).length > 0 ? configObj : undefined,
      });
      
      toast.success("Routine added successfully", {
        description: `Added "${routineId}" to flow`,
      });
      
      setOpen(false);
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add routine";
      toast.error("Failed to add routine", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm">Add Routine</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        {step === "select" ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle>Select Routine</DialogTitle>
              <DialogDescription>
                Choose a routine from the factory to add to this flow
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col gap-4 px-6 py-4">
              {/* Search and Filter */}
              <div className="flex gap-2 flex-shrink-0">
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
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredRoutines.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    {searchQuery || selectedCategory !== "all"
                      ? "No routines found matching your filters"
                      : "No routines available"}
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-3 space-y-2">
                      {filteredRoutines.map((routine) => (
                        <button
                          key={routine.name}
                          type="button"
                          onClick={() => handleRoutineSelect(routine)}
                          className={cn(
                            "w-full text-left p-4 rounded-lg border transition-all",
                            "hover:bg-accent/50 hover:border-primary/50",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-base">{routine.name}</span>
                                {routine.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {routine.category}
                                  </Badge>
                                )}
                              </div>
                              {routine.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {routine.description}
                                </p>
                              )}
                              {routine.tags && routine.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {routine.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="text-[10px] px-2 py-0.5"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {routine.example_config &&
                                Object.keys(routine.example_config).length > 0 && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <span className="font-medium">Example config:</span>{" "}
                                    {JSON.stringify(routine.example_config)}
                                  </div>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRoutineSelect(routine);
                                }}
                              >
                                Select
                              </Button>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <DialogTitle>Configure Routine</DialogTitle>
                  <DialogDescription>
                    Configure &quot;{selectedRoutine?.name}&quot; before adding to flow
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {/* Routine Info Card */}
                {selectedRoutine && (
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{selectedRoutine.name}</h3>
                          {selectedRoutine.category && (
                            <Badge variant="secondary">{selectedRoutine.category}</Badge>
                          )}
                        </div>
                        {selectedRoutine.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {selectedRoutine.description}
                          </p>
                        )}
                        {interfaceInfo && (
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1.5">
                              <Inbox className="h-4 w-4 text-blue-500" />
                              {interfaceInfo.slots?.length || 0} input slots
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Send className="h-4 w-4 text-emerald-500" />
                              {interfaceInfo.events?.length || 0} output events
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="routineId">
                      Routine ID <span className="text-destructive">*</span>
                    </Label>
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
                      rows={6}
                      className="font-mono text-sm"
                    />
                    {selectedRoutine?.example_config &&
                      Object.keys(selectedRoutine.example_config).length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Example config:
                          </p>
                          <pre className="text-xs bg-muted p-2 rounded border overflow-x-auto">
                            {JSON.stringify(selectedRoutine.example_config, null, 2)}
                          </pre>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <DialogFooter className="px-6 py-4 border-t">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" disabled={loading || !routineId}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Add Routine
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
