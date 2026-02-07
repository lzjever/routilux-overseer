import { use } from "react";
import { getPluginManager } from "@/lib/plugins/plugin-manager";

export function PluginHeader() {
  const pluginManager = getPluginManager();
  const plugins = pluginManager.getPlugins();
  const enabledCount = plugins.filter((p) => p.status === "enabled").length;

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">Plugins</h1>
      <p className="text-muted-foreground">
        Manage your plugins. {enabledCount} of {plugins.length} enabled.
      </p>
    </div>
  );
}
