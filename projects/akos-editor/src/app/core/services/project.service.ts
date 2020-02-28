import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SceneService } from './scene.service';
import { Project } from '../types/project';
import { StatefulService } from 'akos-common';
import { GameDescriptor } from 'akos-common';
import { GameService } from './game.service';
import { ProjectDescriptor } from '../types/project-descriptor';
import { NativeService } from './native.service';

@Injectable()
export class ProjectService extends StatefulService<Project> {

  private static readonly PROJECT_FILTER = {name: 'Akos Project', extensions: ['akp']};

  constructor(
    private router: Router,
    private nativeService: NativeService,
    private gameService: GameService,
    private sceneService: SceneService
  ) {
    super();
  }

  async saveProject() {

    let project = this.getState();
    if (!project) {

      let file = await this.nativeService.selectNewFile([ProjectService.PROJECT_FILTER]);
      if (!file) {
        // Selection has been cancelled
        return;
      }

      if (!await this.nativeService.checkProjectDirectory(file)) {
        // TODO display a notification
        return;
      }

      this.setState({});
      this.nativeService.setProjectFile(file);
      this.router.navigateByUrl('metadata');
    }

    await this.nativeService.writeFile(this.nativeService.getState().projectFile, JSON.stringify(this.getProjectDescriptor()));
  }

  async loadProject() {

    let file = await this.nativeService.selectExistingFile([ProjectService.PROJECT_FILTER]);

    if (file) {

      let data = JSON.parse(await this.nativeService.readFile(file));

      this.setState({});
      this.nativeService.setProjectFile(file);
      this.gameService.setGame(data.game);
      this.sceneService.resetScenes(data.scenes);
      this.router.navigateByUrl('metadata');
    }
  }

  closeProject() {
    this.resetState();
    this.gameService.resetGame();
    this.sceneService.resetScenes();
    this.router.navigateByUrl('');
  }

  async buildGame() {
    await this.saveProject();
    await this.nativeService.buildGame(this.getGameDescriptor());
  }

  private getProjectDescriptor(): ProjectDescriptor {
    return {
      project: this.getState(),
      ...this.getGameDescriptor()
    };
  }

  private getGameDescriptor(): GameDescriptor {

    this.sceneService.cleanCommands();

    return {
      game: this.gameService.getState(),
      scenes: this.sceneService.getState()
    };
  }
}
