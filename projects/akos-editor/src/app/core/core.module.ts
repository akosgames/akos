import { NgModule } from '@angular/core';
import { ProjectService } from './services/project.service';
import { ScenesService } from './services/scenes.service';
import { BuildService } from './services/build.service';
import { NativeService, NativeState } from 'akos-common';
import { GameService } from './services/game.service';
import { ProjectState } from './states/project.state';
import { GameState } from './states/game.state';
import { ScenesState } from './states/scenes.state';
import { UiService } from './services/ui.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UiState } from './states/ui.state';
import { ApplicationService } from './services/application.service';
import { ThemeState } from './states/theme.state';
import { ThemeService } from './services/theme.service';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [
    ApplicationService,
    NativeService,
    ProjectService,
    BuildService,
    UiService,
    GameService,
    ThemeService,
    ScenesService,
    NativeState,
    ProjectState,
    UiState,
    GameState,
    ThemeState,
    ScenesState
  ]
})
export class CoreModule {
}
