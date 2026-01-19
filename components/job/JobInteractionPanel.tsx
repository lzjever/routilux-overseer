"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useJobStateStore } from "@/lib/stores/jobStateStore";
import { Loader2, Send } from "lucide-react";

interface JobInteractionPanelProps {
  jobId: string;
  serverUrl: string;
  jobStatus: string;
}

export function JobInteractionPanel({ jobId, serverUrl, jobStatus }: JobInteractionPanelProps) {
  const [sharedDataKey, setSharedDataKey] = useState("");
  const [sharedDataValue, setSharedDataValue] = useState("");
  const [loading, setLoading] = useState(false);
  const sharedData = useJobStateStore((state) => state.getSharedData(jobId));

  const handleUpdateSharedData = async () => {
    if (!sharedDataKey || !serverUrl) return;
    setLoading(true);
    try {
      // Note: This API endpoint doesn't exist yet in Routilux
      // This is a proposed API extension
      const response = await fetch(`${serverUrl}/api/v1/jobs/${jobId}/shared-data/${sharedDataKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: JSON.parse(sharedDataValue) }),
      });

      if (!response.ok) {
        throw new Error("Failed to update shared data");
      }

      // Refresh job state
      const { loadJobState } = useJobStateStore.getState();
      await loadJobState(jobId, serverUrl);

      setSharedDataKey("");
      setSharedDataValue("");
    } catch (error) {
      console.error("Failed to update shared data:", error);
      alert("Failed to update shared data. This feature requires Routilux API extension.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Interaction</CardTitle>
        <CardDescription>
          Communicate with running job (requires Routilux API extension)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Update Shared Data */}
        <div className="space-y-3">
          <Label>Update Shared Data</Label>
          <Input
            placeholder="Key"
            value={sharedDataKey}
            onChange={(e) => setSharedDataKey(e.target.value)}
          />
          <Textarea
            placeholder="Value (JSON)"
            value={sharedDataValue}
            onChange={(e) => setSharedDataValue(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleUpdateSharedData}
            disabled={loading || !sharedDataKey || jobStatus !== "running"}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Update Shared Data
          </Button>
        </div>

        {/* Current Shared Data */}
        <div className="space-y-2">
          <Label>Current Shared Data</Label>
          <ScrollArea className="h-48 border rounded p-3">
            {Object.keys(sharedData).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No shared data</p>
            ) : (
              <pre className="text-xs">
                {JSON.stringify(sharedData, null, 2)}
              </pre>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
