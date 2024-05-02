import { Convertor } from "./convertor";
import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

export interface CanvasPluginSettings {
  width: number;
  height: number;
}

const DEFAULT_SETTINGS: CanvasPluginSettings = {
  width: 200,
  height: 60,
};

export default class CanvasPlugin extends Plugin {
  settings: CanvasPluginSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "note-to-canvas",
      name: "Export note to canvas",
      callback: new Convertor(this.app, this).nodeToCanvas,
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new CanvasSettingTab(this.app, this));

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    this.registerDomEvent(document, "click", (evt: MouseEvent) => {
      console.log("click", evt);
    });
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
  }
}
