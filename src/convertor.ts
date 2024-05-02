import { App, MarkdownView } from "obsidian";
import CanvasPlugin from "./main";
import { convertToTree } from "./utils";

export class Convertor {
    plugin: CanvasPlugin;
    app: App;
  
    constructor(app: App, plugin: CanvasPlugin) {
      this.plugin = plugin;
      this.app = app;
    }
  
    async nodeToCanvas() {
      const ws = this.app.workspace;
      const vault = this.app.vault;
  
      const view = ws.getActiveViewOfType(MarkdownView);
      // @ts-ignore
      const data = view?.data ?? ws.activeEditor?.data;
  
      const file = ws.getActiveFile();
      if (!file) {
        return;
      }
      const cache = this.app.metadataCache.getFileCache(file);
  
      const jsonData = convertToTree(cache?.headings ?? [], this.plugin.settings);
  
      const adapter = vault.adapter;
      const output = `${file.parent?.path ?? ""}/${file.basename}.canvas`;
      if (await adapter.exists(output)) {
        await adapter.trashLocal(output);
      }
      await vault.create(output, JSON.stringify(jsonData));
      const leaf = ws.getLeaf("tab");
      const outFile = vault.getFileByPath(output);
      if (outFile) {
        await leaf.openFile(outFile);
      }
    }
  }