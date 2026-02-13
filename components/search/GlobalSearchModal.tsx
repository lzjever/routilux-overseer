"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { debounce } from "@/lib/utils/debounce";
import { useSearchStore, type SearchResult } from "@/lib/stores/searchStore";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useJobStore } from "@/lib/stores/jobStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Play, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";

export function GlobalSearchModal() {
  const router = useRouter();
  const {
    isOpen,
    query,
    results,
    recentSearches,
    selectedIndex,
    setQuery,
    setResults,
    addRecentSearch,
    open,
    close,
    setSelectedIndex,
    clear,
  } = useSearchStore();
  const { flows } = useFlowStore();
  const { jobs } = useJobStore();
  const { connected, serverUrl } = useConnectionStore();
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      addRecentSearch(query);
      router.push(result.url);
      close();
    },
    [addRecentSearch, query, router, close]
  );

  // Keyboard shortcut: Cmd/Ctrl+K
  useKeyboardShortcut({
    key: "k",
    meta: true,
    ctrl: true,
    handler: () => {
      if (isOpen) {
        close();
      } else {
        open();
      }
    },
  });

  // Keyboard shortcut: Escape
  useKeyboardShortcut({
    key: "Escape",
    handler: () => {
      if (isOpen) {
        close();
      }
    },
    enabled: isOpen,
  });

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search
  useEffect(() => {
    if (!isOpen || !connected || !serverUrl) {
      setResults([]);
      return;
    }

    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    setSearching(true);

    // Debounce search
    const timeoutId = setTimeout(() => {
      const searchResults: SearchResult[] = [];

      // Search flows
      flows.forEach((flow) => {
        const flowId = flow.flow_id.toLowerCase();
        const description = "";

        if (flowId.includes(trimmedQuery) || description.includes(trimmedQuery)) {
          searchResults.push({
            id: flow.flow_id,
            type: "flow",
            title: flow.flow_id,
            description: `Flow with ${Object.keys(flow.routines ?? {}).length} routines`,
            url: `/flows/${flow.flow_id}`,
            metadata: { flow },
          });
        }
      });

      // Search jobs
      jobs.forEach((job) => {
        const jobId = job.job_id.toLowerCase();
        const flowId = job.flow_id?.toLowerCase() || "";
        const status = job.status?.toLowerCase() || "";

        if (
          jobId.includes(trimmedQuery) ||
          flowId.includes(trimmedQuery) ||
          status.includes(trimmedQuery)
        ) {
          searchResults.push({
            id: job.job_id,
            type: "job",
            title: job.job_id,
            description: `Flow: ${job.flow_id || "Unknown"} • Status: ${job.status || "Unknown"}`,
            url: `/jobs/${job.job_id}`,
            metadata: { job },
          });
        }
      });

      // Sort results: exact matches first, then by type
      searchResults.sort((a, b) => {
        const aExact = a.title.toLowerCase() === trimmedQuery ? 1 : 0;
        const bExact = b.title.toLowerCase() === trimmedQuery ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;

        const typeOrder = { flow: 0, job: 1, log: 2 };
        return typeOrder[a.type] - typeOrder[b.type];
      });

      setResults(searchResults);
      setSearching(false);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      setSearching(false);
    };
  }, [query, isOpen, connected, serverUrl, flows, jobs, setResults]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { selectedIndex: cur, results: res } = useSearchStore.getState();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(cur < res.length - 1 ? cur + 1 : cur);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(cur > 0 ? cur - 1 : -1);
      } else if (e.key === "Enter" && cur >= 0 && res[cur]) {
        e.preventDefault();
        handleSelectResult(res[cur]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, setSelectedIndex, handleSelectResult]);

  const handleRecentSearch = (recentQuery: string) => {
    setQuery(recentQuery);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flow":
        return <FileText className="h-4 w-4" />;
      case "job":
        return <Play className="h-4 w-4" />;
      case "log":
        return <Clock className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "flow":
        return "Flows";
      case "job":
        return "Jobs";
      case "log":
        return "Logs";
      default:
        return "Results";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(opened) => (opened ? open() : close())}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search flows, jobs, logs..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />
            {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {/* Results or Recent Searches */}
          <ScrollArea className="max-h-[400px]">
            {query.trim() ? (
              // Search Results
              <div className="p-2">
                {results.length === 0 && !searching ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found for &quot;{query}&quot;
                  </div>
                ) : (
                  Object.entries(groupedResults).map(([type, typeResults]) => (
                    <div key={type} className="mb-4">
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {getTypeLabel(type)}
                      </div>
                      {typeResults.map((result, index) => {
                        const globalIndex = results.indexOf(result);
                        const isSelected = globalIndex === selectedIndex;
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelectResult(result)}
                            className={cn(
                              "w-full flex items-start gap-3 px-3 py-2 rounded-md text-left transition-colors",
                              isSelected && "bg-accent"
                            )}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            <div className="mt-0.5 text-muted-foreground">
                              {getTypeIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{result.title}</div>
                              {result.description && (
                                <div className="text-sm text-muted-foreground truncate">
                                  {result.description}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {result.type}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Recent Searches
              <div className="p-2">
                {recentSearches.length > 0 ? (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Recent Searches
                    </div>
                    {recentSearches.map((recentQuery) => (
                      <button
                        key={recentQuery}
                        onClick={() => handleRecentSearch(recentQuery)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm hover:bg-accent transition-colors"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{recentQuery}</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Start typing to search flows, jobs, and logs
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">Enter</kbd>
                <span>Select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted">Esc</kbd>
                <span>Close</span>
              </span>
            </div>
            {results.length > 0 && (
              <span>
                {results.length} result{results.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
