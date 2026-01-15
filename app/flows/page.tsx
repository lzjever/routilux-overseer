"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFlowStore } from "@/lib/stores/flowStore";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Network, ArrowRight, Loader2, Plug } from "lucide-react";
import Link from "next/link";

export default function FlowsPage() {
  const router = useRouter();
  const { connected, serverUrl } = useConnectionStore();
  const { flows, loading, loadFlows } = useFlowStore();

  useEffect(() => {
    if (serverUrl) {
      loadFlows(serverUrl);
    }
  }, [serverUrl, loadFlows]);

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Not Connected
              </CardTitle>
              <CardDescription>
                Connect to a Routilux server to view flows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/connect")} className="w-full">
                Connect to Server
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Flows</h1>
        <p className="text-muted-foreground">
          Manage and monitor your workflow definitions
        </p>
        <div className="text-sm text-muted-foreground mt-2">
          Connected to: {serverUrl}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : flows.size === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Network className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No flows found</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              There are no flows available on the server.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from(flows.values()).map((flow) => (
            <Card
              key={flow.flow_id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/flows/${flow.flow_id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{flow.flow_id}</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  {Object.keys(flow.routines).length} routines •{" "}
                  {flow.connections.length} connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Execution</span>
                    <Badge variant="outline">
                      {flow.execution_strategy}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Workers</span>
                    <span className="font-mono">{flow.max_workers}</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/flows/${flow.flow_id}`);
                    }}
                  >
                    View Flow
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
