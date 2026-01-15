// 示例插件：Hello World Plugin
// 用于测试插件系统是否正常工作

import type { OverseerPlugin, PluginContext } from "../types";

const helloWorldPlugin: OverseerPlugin = {
  id: "builtin:hello-world",
  name: "Hello World",
  version: "1.0.0",
  description: "A simple Hello World plugin for testing",
  author: "Routilux Overseer Team",

  install(context: PluginContext) {
    console.log("🔌 Hello World Plugin: Installing...");

    // 监听 Job 完成事件
    const unsubscribe = context.events.on("job:completed", (data) => {
      console.log(`✅ Job ${data.job_id} completed!`);
      context.ui.toast(`Job ${data.job_id} completed!`, "success");
    });

    // 保存取消订阅函数，用于卸载时清理
    (this as any)._unsubscribe = unsubscribe;

    // 测试存储
    context.storage.set("hello-world:test", {
      message: "Hello from plugin!",
      timestamp: new Date().toISOString(),
    });

    console.log("✅ Hello World Plugin: Installed successfully");
  },

  uninstall() {
    console.log("🔌 Hello World Plugin: Uninstalling...");

    // 清理事件监听器
    if ((this as any)._unsubscribe) {
      (this as any)._unsubscribe();
      delete (this as any)._unsubscribe;
    }

    console.log("✅ Hello World Plugin: Uninstalled successfully");
  },

  enable() {
    console.log("🔌 Hello World Plugin: Enabled");
  },

  disable() {
    console.log("🔌 Hello World Plugin: Disabled");
  },
};

export default helloWorldPlugin;
