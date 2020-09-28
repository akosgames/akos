import { Injectable } from '@angular/core';
import { GameDescriptor, NativeService, NativeState, sanitizeGameName } from 'akos-common';
import { filter, first } from 'rxjs/operators';
import { GameDescriptorState } from '../states/game-descriptor.state';
import { GameService } from './game.service';
import { SettingsService } from './settings.service';
import sanitize from 'sanitize-filename';

@Injectable()
export class ApplicationService {

  constructor(
    private nativeState: NativeState,
    private nativeService: NativeService,
    private gameService: GameService,
    private settingsService: SettingsService,
    private gameDescriptorState: GameDescriptorState
  ) {
  }

  start() {

    this.nativeState.observe()
      .pipe(
        filter(nativeContext => !!nativeContext),
        first()
      )
      .subscribe(async () => {

        let gameDescriptor = await this.loadGameDescriptor();
        this.nativeService.setAppName(gameDescriptor.game.name);

        await this.nativeService.ensureDir(this.getTempDir());
        await this.nativeService.ensureDir(this.getSavesDir());

        await this.settingsService.loadSettings();
      });
  }

  exit() {
    this.nativeService.exit();
  }

  getGameDir() {
    return `${this.nativeService.getAppDataDir()}/Akos Engine/${this.getSanitizedGameName()}`;
  }

  getSavesDir() {
    return `${this.getGameDir()}/saves`;
  }

  getTempDir() {
    return `${this.nativeService.getTempDir()}/Akos Engine/${this.getSanitizedGameName()}`;
  }

  private async loadGameDescriptor(): Promise<GameDescriptor> {

    let file = `${this.nativeState.get().workingDir}/game-descriptor.akg`;
    let gameDescriptor = JSON.parse(await this.nativeService.readFile(file));

    this.gameDescriptorState.set(gameDescriptor);
    return gameDescriptor;
  }

  private getSanitizedGameName() {
    return sanitizeGameName(this.gameDescriptorState.get().game.name);
  }
}
