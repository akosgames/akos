import { Injectable } from '@angular/core';
import { UiState } from '../states/ui.state';
import { Settings, SettingsState } from '../states/settings.state';
import { NativeService } from 'akos-common';
import { KeyboardShortcutsSelectService } from 'ng-keyboard-shortcuts';
import { ApplicationState } from '../states/application.state';

@Injectable()
export class SettingsService {

  constructor(
    private nativeService: NativeService,
    private shortcutService: KeyboardShortcutsSelectService,
    private applicationState: ApplicationState,
    private settingsState: SettingsState,
    private uiState: UiState,
  ) {
    this.shortcutService
      .select('alt + enter')
      .subscribe(() => this.toggleFullscreen());
  }

  async loadSettings() {

    let settingsFile = `${this.applicationState.get().gameDir}/settings.json`;
    if (await this.nativeService.exists(settingsFile)) {
      this.setSettings(JSON.parse(await this.nativeService.readFile(settingsFile)));
    } else {
      await this.restoreDefaults();
    }
  }

  async saveSettings(settings: Settings) {

    this.setSettings(settings);

    let gameDir = this.applicationState.get().gameDir;
    await this.nativeService.ensureDir(gameDir);
    await this.nativeService.writeFile(`${gameDir}/settings.json`, JSON.stringify(settings, null, 2));
  }

  async restoreDefaults() {
    await this.saveSettings({
      fullscreen: true
    });
  }

  showSettings() {
    this.uiState.displaySettings(true);
  }

  hideSettings() {
    this.uiState.displaySettings(false);
  }

  private setSettings(settings: Settings) {
    this.nativeService.setFullscreen(settings.fullscreen);
    this.settingsState.set(settings);
  }

  private toggleFullscreen() {
    let settings = this.settingsState.get();
    this.saveSettings({...settings, fullscreen: !settings.fullscreen});
  }
}
