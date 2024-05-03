import { App, HeadingCache, MarkdownView } from "obsidian";
import CanvasPlugin from "./main";
import { convertToCache, convertToTree } from "./utils";

export class Convertor {
  app: App;
  plugin: CanvasPlugin;

  constructor(app: App, plugin: CanvasPlugin) {
    this.app = app;
    this.plugin = plugin;
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
    const lists = cache?.listItems?.map((item) => {
      const { start, end } = item.position;

      return {
        ...item,
        indent: start.col,
        text: data.slice(start.offset, end.offset),
      };
    });

    console.table(lists);

    const headings = [
      { heading: file.basename, level: 1 } as HeadingCache,
      ...(cache?.headings ?? []),
    ];
    const jsonData = convertToCache(cache ?? {}, data, this.plugin.settings, file.basename);

    const adapter = vault.adapter;
    const output = `${file.parent?.path ?? ""}/${file.basename}.canvas`;
    if (await adapter.exists(output)) {
      await adapter.trashLocal(output);
    }
    await vault.create(output, JSON.stringify(jsonData, undefined, 2));
    const leaf = ws.getLeaf("tab");
    const outFile = vault.getFileByPath(output);
    if (outFile) {
      await leaf.openFile(outFile);
    }
  }
}
