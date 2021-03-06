import { Injectable } from '@angular/core';
import { UiState } from '../states/ui.state';
import { GameState } from '../states/game.state';
import { NativeService } from 'akos-common';
import { Save } from '../types/save';
import { SaveState } from '../states/save.state';
import moment from 'moment';
import { UiService } from './ui.service';
import { Router } from '@angular/router';
import { Game } from '../types/game';
import { ApplicationState } from '../states/application.state';

@Injectable()
export class SaveService {

  constructor(
    private router: Router,
    private applicationState: ApplicationState,
    private gameState: GameState,
    private uiState: UiState,
    private saveState: SaveState,
    private nativeService: NativeService,
    private uiService: UiService
  ) {
  }

  async createSave(saveId?: string) {

    if (saveId && saveId !== 'autosave' && saveId !== 'quicksave') {

      let confirm = await this.uiService.confirm({
        message: 'Overwrite this save?'
      });

      if (!confirm) {
        return;
      }
    }

    let application = this.applicationState.get();
    let saves = this.saveState.get();

    let lastId = saves.length ? saves[saves.length - 1].id : '0';
    lastId = (lastId === 'autosave' || lastId === 'quicksave') ? '0' : lastId;

    let game = this.gameState.get();
    game.playTime = moment.duration(game.playTime).add(moment().diff(moment(game.sessionStart))).asMilliseconds();

    let save: Save = {
      id: saveId ? saveId : (Number(lastId) + 1).toString(),
      date: new Date().getTime(),
      game
    };

    let saveFile = `${application.savesDir}/${save.id}.aks`;
    let thumbFile = `${application.savesDir}/${save.id}-${save.date}.png`;
    let tempThumbFile = `${application.tempDir}/thumb.png`;

    await this.nativeService.writeFile(saveFile, JSON.stringify(save));
    await this.nativeService.copy(tempThumbFile, thumbFile);

    let files = await this.nativeService.readDir(application.savesDir);
    files
      .filter(file => file.startsWith(`${save.id}-`) && file !== `${save.id}-${save.date}.png`)
      .forEach(async file => await this.nativeService.remove(`${application.savesDir}/${file}`));

    await this.updateSaveState();
  }

  async loadSave(saveId: string) {

    if (!await this.uiService.confirmQuitGame()) {
      return;
    }

    let saveFile = `${this.applicationState.get().savesDir}/${saveId}.aks`;
    let game: Game = JSON.parse(await this.nativeService.readFile(saveFile)).game;
    game.sessionStart = new Date().getTime();

    this.gameState.set(game);
    this.gameState.applyChanges();
    this.gameState.load();

    await this.router.navigateByUrl('/scene');
    this.hideLoadMenu();
  }

  async deleteSave(saveId: string) {

    let confirm = await this.uiService.confirm({
      message: 'Delete this save?'
    });

    if (!confirm) {
      return;
    }

    let savesDir = this.applicationState.get().savesDir;
    let save = this.saveState.get().find(save => save.id === saveId);

    await this.nativeService.remove(`${savesDir}/${saveId}.aks`);
    await this.nativeService.remove(`${savesDir}/${saveId}-${save}.png`);
    await this.updateSaveState();
  }

  async captureSaveThumb() {

    let img = await this.nativeService.takeScreenshot();
    let file = `${this.applicationState.get().tempDir}/thumb.png`;

    await this.nativeService.writeFile(file, img.resize({height: 300}).toPNG());
  }

  async showSaveMenu() {
    await this.updateSaveState();
    this.uiState.displaySaveMenu(true);
  }

  hideSaveMenu() {
    this.uiState.displaySaveMenu(false);
  }

  async showLoadMenu() {
    await this.updateSaveState();
    this.uiState.displayLoadMenu(true);
  }

  hideLoadMenu() {
    this.uiState.displayLoadMenu(false);
  }

  getThumbUrl(saveId: string) {
    let save = this.saveState.get().find(save => save.id === saveId);
    return `file://${this.applicationState.get().savesDir}/${saveId}-${save.date}.png`;
  }

  async updateSaveState() {

    let savesDir = this.applicationState.get().savesDir;
    let files = await this.nativeService.readDir(savesDir);
    let saves = await Promise.all(
      files
        .filter(file => file.endsWith('.aks'))
        .map(file => `${savesDir}/${file}`)
        .map(async file => JSON.parse(await this.nativeService.readFile(file)) as Save)
    );

    this.saveState.set(saves.sort((a, b) => {

      if (a.id === 'autosave') {
        return -1;
      }

      if (b.id === 'autosave') {
        return 1;
      }

      if (a.id === 'quicksave') {
        return -1;
      }

      if (b.id === 'quicksave') {
        return 1;
      }

      return Number(a.id) - Number(b.id);

    }));
  }
}
