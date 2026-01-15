import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

interface SharedDataViewerProps {
  sharedData: Record<string, any>;
}

export function SharedDataViewer({ sharedData }: SharedDataViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Data</CardTitle>
        <CardDescription>
          Execution-wide data storage accessible by all routines
        </CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(sharedData).length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No shared data</p>
        ) : (
          <ScrollArea className="h-64 border rounded">
            <div className="p-2 space-y-1">
              {Object.entries(sharedData).map(([key, value]) => (
                <Collapsible key={key}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-2 border rounded hover:bg-muted/50">
                    <span className="font-mono text-sm text-left">{key}</span>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-2 bg-muted/50 rounded mt-1">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
