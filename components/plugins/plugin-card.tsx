import { PluginInfo } from "@/lib/plugins/types";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Trash2, Power, PowerOff } from "lucide-react";

interface PluginCardProps {
  plugin: PluginInfo;
  onToggle: (pluginId: string) => Promise<void>;
  onUninstall: (pluginId: string) => Promise<void>;
}

export function PluginCard({ plugin, onToggle, onUninstall }: PluginCardProps) {
  const { plugin: p, status, builtin } = plugin;
  const isEnabled = status === "enabled";

  const handleToggle = async () => {
    await onToggle(p.id);
  };

  const handleUninstall = async () => {
    if (builtin) {
      // Built-in plugins cannot be uninstalled
      return;
    }
    if (confirm(`Are you sure you want to uninstall "${p.name}"?`)) {
      await onUninstall(p.id);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <Badge variant={builtin ? "secondary" : "default"}>
              {builtin ? "Built-in" : "User"}
            </Badge>
            <Badge variant={isEnabled ? "default" : "secondary"}>{status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>v{p.version}</span>
            {p.author && <span>by {p.author}</span>}
            {p.homepage && (
              <a
                href={p.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                Homepage <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={status === "installed"}
          />
          {!builtin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUninstall}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
