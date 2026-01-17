"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { createAPI } from "@/lib/api";

interface FlowDSLExportProps {
  flowId: string;
  serverUrl: string;
}

export function FlowDSLExport({ flowId, serverUrl }: FlowDSLExportProps) {
  const [format, setFormat] = useState<"yaml" | "json">("yaml");
  const [dsl, setDsl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const api = createAPI(serverUrl);
      const dslString = await api.flows.exportFlowDSL(flowId);
      setDsl(dslString);
    } catch (error) {
      console.error("Failed to export DSL:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([dsl], { type: format === "yaml" ? "text/yaml" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${flowId}_flow.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Flow DSL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={format} onValueChange={(v: any) => setFormat(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={loading} size="sm">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export
          </Button>
          {dsl && (
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>

        {dsl && (
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
            {dsl}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
