import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/types/project';
import { NativeService } from '../../../core/services/native.service';

@Component({
  selector: 'ak-toolbar',
  templateUrl: './toolbar.container.html',
  styleUrls: ['./toolbar.container.scss']
})
export class ToolbarContainer implements OnInit {

  project: Project;

  constructor(private projectService: ProjectService, private nativeService: NativeService) {
  }

  ngOnInit() {
    this.projectService.getObservable().subscribe(project => this.project = project);
  }

  onCreate() {
    this.projectService.saveProject();
  }

  onOpen() {
    this.projectService.loadProject();
  }

  onSave() {
    this.projectService.saveProject();
  }

  onClose() {
    this.projectService.closeProject();
  }

  onQuit() {
    this.nativeService.exit();
  }

  onBuildGame() {
    this.projectService.buildGame();
  }
}
