"use client";

import { useState, useEffect, useCallback } from "react";
import { PluginHeader, PluginCard, PluginFilters } from "@/components/plugins";
import { PluginInfo } from "@/lib/plugins/types";
import { getPluginManager } from "@/lib/plugins/plugin-manager";
import { toast } from "sonner";

type FilterStatus = "all" | "enabled" | "disabled" | "builtin" | "user";

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<PluginInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);

  // Load plugins
  const loadPlugins = useCallback(() => {
    try {
      const pluginManager = getPluginManager();
      const allPlugins = pluginManager.getPlugins();
      setPlugins(allPlugins);
      setFilteredPlugins(allPlugins);
    } catch (error) {
      console.error("Failed to load plugins:", error);
      toast.error("Failed to load plugins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlugins();
  }, [loadPlugins]);

  // Filter plugins
  useEffect(() => {
    let filtered = [...plugins];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.plugin.name.toLowerCase().includes(query) ||
          p.plugin.description?.toLowerCase().includes(query) ||
          p.plugin.id.toLowerCase().includes(query)
      );
    }

    // Status filter
    switch (statusFilter) {
      case "enabled":
        filtered = filtered.filter((p) => p.status === "enabled");
        break;
      case "disabled":
        filtered = filtered.filter((p) => p.status === "disabled");
        break;
      case "builtin":
        filtered = filtered.filter((p) => p.builtin);
        break;
      case "user":
        filtered = filtered.filter((p) => !p.builtin);
        break;
    }

    setFilteredPlugins(filtered);
  }, [plugins, searchQuery, statusFilter]);

  // Handle toggle
  const handleToggle = async (pluginId: string) => {
    try {
      const pluginManager = getPluginManager();
      const plugin = pluginManager.getPlugin(pluginId);

      if (!plugin) {
        toast.error("Plugin not found");
        return;
      }

      if (plugin.status === "enabled") {
        await pluginManager.disable(pluginId);
        toast.success(`Plugin "${plugin.plugin.name}" disabled`);
      } else {
        await pluginManager.enable(pluginId);
        toast.success(`Plugin "${plugin.plugin.name}" enabled`);
      }

      // Reload plugins
      loadPlugins();
    } catch (error) {
      console.error("Failed to toggle plugin:", error);
      toast.error("Failed to toggle plugin");
    }
  };

  // Handle uninstall
  const handleUninstall = async (pluginId: string) => {
    try {
      const pluginManager = getPluginManager();
      await pluginManager.unregister(pluginId);
      toast.success("Plugin uninstalled");

      // Reload plugins
      loadPlugins();
    } catch (error) {
      console.error("Failed to uninstall plugin:", error);
      toast.error("Failed to uninstall plugin");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading plugins...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PluginHeader />
      <PluginFilters
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
      />
      <div className="grid gap-4">
        {filteredPlugins.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No plugins found matching your filters.
          </div>
        ) : (
          filteredPlugins.map((plugin) => (
            <PluginCard
              key={plugin.plugin.id}
              plugin={plugin}
              onToggle={handleToggle}
              onUninstall={handleUninstall}
            />
          ))
        )}
      </div>
    </div>
  );
}
