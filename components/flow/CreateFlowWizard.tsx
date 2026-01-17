"use client";

import { useState } from "react";
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
import { createAPI } from "@/lib/api";
import { Loader2, FileText, Upload, Copy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateFlowWizardProps {
  serverUrl: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

type CreationMethod = "scratch" | "import" | "clone" | "template";

export function CreateFlowWizard({
  serverUrl,
  onSuccess,
  trigger,
}: CreateFlowWizardProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<CreationMethod>("scratch");
  const [flowId, setFlowId] = useState("");
  const [dslContent, setDslContent] = useState("");
  const [cloneFlowId, setCloneFlowId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowId || !serverUrl) return;

    setLoading(true);
    setError(null);
    try {
      const api = createAPI(serverUrl);
      let request: any = { flow_id: flowId };

      if (method === "import" && dslContent.trim()) {
        try {
          const parsed = JSON.parse(dslContent);
          request.dsl = parsed;
        } catch {
          // Try YAML-like structure or use as-is
          request.dsl = dslContent;
        }
      } else if (method === "clone" && cloneFlowId) {
        // For clone, we'd need to fetch the flow first and then create with its DSL
        const existingFlow = await api.flows.get(cloneFlowId);
        const dsl = await api.flows.exportDSL(cloneFlowId, "json");
        request.dsl = dsl;
        request.flow_id = flowId; // New ID
      }

      await api.flows.create(request);
      setOpen(false);
      setStep(1);
      setMethod("scratch");
      setFlowId("");
      setDslContent("");
      setCloneFlowId("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flow");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setMethod("scratch");
    setFlowId("");
    setDslContent("");
    setCloneFlowId("");
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) handleReset();
      }}
    >
      <DialogTrigger asChild>
        {trigger || <Button>Create Flow</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Flow</DialogTitle>
          <DialogDescription>
            {step === 1 && "Choose how you want to create the flow"}
            {step === 2 && "Provide the details for your flow"}
            {step === 3 && "Review and create"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Choose Method */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <RadioGroup value={method} onValueChange={(v) => setMethod(v as CreationMethod)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="scratch" id="scratch" />
                  <Label htmlFor="scratch" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Create from Scratch</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start with an empty flow and build it step by step
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="import" id="import" />
                  <Label htmlFor="import" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">Import DSL</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Import from YAML or JSON DSL definition
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="clone" id="clone" />
                  <Label htmlFor="clone" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      <span className="font-medium">Clone Existing Flow</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Copy an existing flow and modify it
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer opacity-50">
                  <RadioGroupItem value="template" id="template" disabled />
                  <Label htmlFor="template" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-medium">From Template</span>
                      <span className="text-xs text-muted-foreground">(Coming soon)</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start from a pre-built template
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Provide Details */}
          {step === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="flowId">Flow ID *</Label>
                <Input
                  id="flowId"
                  value={flowId}
                  onChange={(e) => setFlowId(e.target.value)}
                  placeholder="e.g., my_workflow"
                  required
                />
              </div>

              {method === "import" && (
                <div className="space-y-2">
                  <Label htmlFor="dslContent">DSL Content (YAML or JSON) *</Label>
                  <Textarea
                    id="dslContent"
                    value={dslContent}
                    onChange={(e) => setDslContent(e.target.value)}
                    placeholder="Paste your flow DSL here..."
                    rows={10}
                    required
                    className="font-mono text-xs"
                  />
                </div>
              )}

              {method === "clone" && (
                <div className="space-y-2">
                  <Label htmlFor="cloneFlowId">Flow to Clone *</Label>
                  <Input
                    id="cloneFlowId"
                    value={cloneFlowId}
                    onChange={(e) => setCloneFlowId(e.target.value)}
                    placeholder="Enter flow ID to clone"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview (simplified) */}
          {step === 3 && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Flow Summary</div>
                <div className="text-sm space-y-1">
                  <div>Flow ID: {flowId}</div>
                  <div>Method: {method}</div>
                  {method === "clone" && <div>Cloning from: {cloneFlowId}</div>}
                </div>
              </div>
            </div>
          )}

          {error && <div className="text-sm text-destructive py-2">{error}</div>}

          <DialogFooter>
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 1 && method) {
                    setStep(2);
                  } else if (step === 2) {
                    if (method === "scratch" || (method === "import" && dslContent) || (method === "clone" && cloneFlowId)) {
                      setStep(3);
                    }
                  }
                }}
                disabled={
                  (step === 1 && !method) ||
                  (step === 2 && !flowId) ||
                  (step === 2 && method === "import" && !dslContent) ||
                  (step === 2 && method === "clone" && !cloneFlowId)
                }
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Flow
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
