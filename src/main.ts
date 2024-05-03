import { Convertor } from "./convertor";
import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

export interface CanvasPluginSettings {
  width: number;
  height: number;
  colGap: number;
  rowGap: number;
  layout: string;
}

export const DEFAULT_SETTINGS: CanvasPluginSettings = {
  width: 200,
  height: 60,
  colGap: 100,
  rowGap: 30,
  layout: "compact",
};

export default class CanvasPlugin extends Plugin {
  settings: CanvasPluginSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "note-to-canvas",
      name: "Convert note to canvas",
      callback: async () => {
        const convertor = new Convertor(this.app, this);
        await convertor.nodeToCanvas();
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new CanvasSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class CanvasSettingTab extends PluginSettingTab {
  plugin: CanvasPlugin;

  constructor(app: App, plugin: CanvasPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Width")
      .setDesc("Node width")
      .addText((text) =>
        text
          .setPlaceholder("Enter your node width")
          .setValue(this.plugin.settings.width.toString())
          .onChange(async (value) => {
            this.plugin.settings.width = parseFloat(value);
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("Height")
      .setDesc("Node height")
      .addText((text) =>
        text
          .setPlaceholder("Enter your node height")
          .setValue(this.plugin.settings.height.toString())
          .onChange(async (value) => {
            this.plugin.settings.height = parseFloat(value);
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl).setName("Column gap").addText((text) =>
      text
        .setValue(this.plugin.settings.colGap.toString())
        .onChange(async (value) => {
          this.plugin.settings.colGap = parseFloat(value);
          await this.plugin.saveSettings();
        })
    );
    new Setting(containerEl).setName("Row gap").addText((text) =>
      text
        .setValue(this.plugin.settings.rowGap.toString())
        .onChange(async (value) => {
          this.plugin.settings.rowGap = parseFloat(value);
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl)
      .setName("Layout ")
      .setDesc("Layout style")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(
            Object.fromEntries(["compact", "loose"].map((type) => [type, type]))
          )
          .setValue(this.plugin.settings.layout)
          .onChange(async (value: string) => {
            this.plugin.settings.layout = value;
            this.plugin.saveSettings();
          })
      );
  }
}
