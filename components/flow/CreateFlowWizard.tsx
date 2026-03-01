"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAPI } from "@/lib/api";
import { Loader2, FileText, Upload, Copy, Sparkles, FileUp } from "lucide-react";
import type { FlowCreateRequest, FlowResponse, ObjectInfo } from "@/lib/api/generated";
import { ApiClientError } from "@/lib/api/error";

interface CreateFlowWizardProps {
  serverUrl: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type CreationMethod = "scratch" | "import" | "clone" | "template";

export function CreateFlowWizard({
  serverUrl,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateFlowWizardProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [method, setMethod] = useState<CreationMethod>("scratch");
  const [flowId, setFlowId] = useState("");
  const [dslContent, setDslContent] = useState("");
  const [dslFileName, setDslFileName] = useState<string | null>(null);
  const [cloneFlowId, setCloneFlowId] = useState("");
  const [templateFlowId, setTemplateFlowId] = useState("");
  const [availableFlows, setAvailableFlows] = useState<FlowResponse[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<ObjectInfo[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setMethod("scratch");
    setFlowId("");
    setDslContent("");
    setDslFileName(null);
    setCloneFlowId("");
    setTemplateFlowId("");
    setError(null);
  };

  useEffect(() => {
    if (!open || !serverUrl) return;
    const api = createAPI(serverUrl);
    const loadSources = async () => {
      setLoadingSources(true);
      try {
        const [flowsResponse, templatesResponse] = await Promise.all([
          api.flows.list(),
          api.factory.listObjects({ objectType: "flow" }),
        ]);
        setAvailableFlows(flowsResponse.flows || []);
        setAvailableTemplates(
          (templatesResponse.objects || []).filter((item) => item.object_type === "flow")
        );
      } catch (err) {
        console.error("Failed to load flow sources:", err);
      } finally {
        setLoadingSources(false);
      }
    };

    loadSources();
  }, [open, serverUrl]);

  const methodLabel = useMemo(() => {
    return {
      scratch: "Create from Scratch",
      import: "Import DSL",
      clone: "Clone Existing Flow",
      template: "From Template",
    }[method];
  }, [method]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setDslContent(text);
    setDslFileName(file.name);
  };

  const parseDslInput = (input: string): Pick<FlowCreateRequest, "dsl" | "dsl_dict"> => {
    try {
      const parsed = JSON.parse(input);
      return { dsl_dict: parsed };
    } catch {
      return { dsl: input };
    }
  };

  const requestFromExport = (exported: unknown): Pick<FlowCreateRequest, "dsl" | "dsl_dict"> => {
    if (!exported) return {};
    if (typeof exported === "string") {
      return parseDslInput(exported);
    }
    if (typeof exported === "object" && exported && "dsl" in (exported as any)) {
      const raw = (exported as { dsl?: string }).dsl ?? "";
      return parseDslInput(raw);
    }
    return { dsl_dict: exported as Record<string, unknown> };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!flowId || !serverUrl) return;

    setLoading(true);
    setError(null);

    try {
      const api = createAPI(serverUrl);
      const request: FlowCreateRequest = { flow_id: flowId };

      if (method === "import") {
        Object.assign(request, parseDslInput(dslContent.trim()));
      }

      if (method === "clone") {
        const exported = await api.flows.exportDSL(cloneFlowId, "json");
        Object.assign(request, requestFromExport(exported));
      }

      if (method === "template") {
        const exported = await api.flows.exportDSL(templateFlowId, "json");
        Object.assign(request, requestFromExport(exported));
      }

      await api.flows.create(request);
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "FLOW_ALREADY_EXISTS") {
        setError(`Flow ID "${flowId}" already exists. Please choose a different name.`);
      } else {
        setError(err instanceof Error ? err.message : "Failed to create flow");
      }
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    !flowId ||
    (method === "import" && !dslContent.trim()) ||
    (method === "clone" && !cloneFlowId) ||
    (method === "template" && !templateFlowId);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{trigger || <Button>Create Flow</Button>}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Flow</DialogTitle>
          <DialogDescription>Choose a method and configure the flow details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <Label>Creation Method</Label>
            <RadioGroup value={method} onValueChange={(v) => setMethod(v as CreationMethod)}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: "scratch",
                    icon: FileText,
                    title: "Create from Scratch",
                    description: "Start with an empty flow and build it step by step.",
                  },
                  {
                    value: "import",
                    icon: Upload,
                    title: "Import DSL",
                    description: "Upload or paste YAML/JSON flow DSL.",
                  },
                  {
                    value: "clone",
                    icon: Copy,
                    title: "Clone Existing Flow",
                    description: "Copy a flow and modify it.",
                  },
                  {
                    value: "template",
                    icon: Sparkles,
                    title: "From Template",
                    description: "Use a factory-registered flow template.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <label
                      key={item.value}
                      className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent cursor-pointer"
                    >
                      <RadioGroupItem value={item.value} id={item.value} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flowId">Flow ID *</Label>
            <Input
              id="flowId"
              value={flowId}
              onChange={(event) => setFlowId(event.target.value)}
              placeholder="e.g., my_workflow"
              required
            />
            <p className="text-xs text-muted-foreground">Creation method: {methodLabel}</p>
          </div>

          {method === "import" && (
            <div className="space-y-3">
              <div className="space-y-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileUp className="h-4 w-4" />
                    <span>{dslFileName || "Upload a local DSL file"}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose file
                  </Button>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.yaml,.yml"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="text-xs text-muted-foreground">
                  Accepted: .json, .yaml, .yml. File content will populate the editor below.
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dslContent">DSL Content *</Label>
                <Textarea
                  id="dslContent"
                  value={dslContent}
                  onChange={(event) => setDslContent(event.target.value)}
                  placeholder="Paste your flow DSL here..."
                  rows={10}
                  required
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}

          {method === "clone" && (
            <div className="space-y-2">
              <Label htmlFor="cloneFlowId">Flow to Clone *</Label>
              <Select value={cloneFlowId} onValueChange={setCloneFlowId}>
                <SelectTrigger id="cloneFlowId">
                  <SelectValue
                    placeholder={loadingSources ? "Loading flows..." : "Select a flow"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableFlows.map((flow) => (
                    <SelectItem key={flow.flow_id} value={flow.flow_id}>
                      {flow.flow_id}
                    </SelectItem>
                  ))}
                  {!loadingSources && availableFlows.length === 0 && (
                    <SelectItem value="__none__" disabled>
                      No flows available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {method === "template" && (
            <div className="space-y-2">
              <Label htmlFor="templateFlowId">Template *</Label>
              <Select value={templateFlowId} onValueChange={setTemplateFlowId}>
                <SelectTrigger id="templateFlowId">
                  <SelectValue
                    placeholder={loadingSources ? "Loading templates..." : "Select a template"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      {template.name}
                    </SelectItem>
                  ))}
                  {!loadingSources && availableTemplates.length === 0 && (
                    <SelectItem value="__none__" disabled>
                      No templates available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {templateFlowId && (
                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  {availableTemplates.find((item) => item.name === templateFlowId)?.description ||
                    "Factory template"}
                </div>
              )}
            </div>
          )}

          {error && <div className="text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button type="submit" disabled={loading || isSubmitDisabled}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Flow
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
