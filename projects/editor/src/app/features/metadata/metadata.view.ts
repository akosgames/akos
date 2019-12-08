import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProjectStore } from '../../stores/project.store';

@Component({
  selector: 'ak-metadata',
  templateUrl: './metadata.view.html',
  styleUrls: ['./metadata.view.scss']
})
export class MetadataView implements OnInit {

  metadata: FormGroup;

  constructor(fb: FormBuilder, private projectStore: ProjectStore) {

    let projectState = projectStore.getState();

    this.metadata = fb.group({
      name: projectState.name,
      version: projectState.version
    });

    this.metadata.valueChanges.subscribe(metadata => this.onMetadataChange(metadata));
  }

  ngOnInit() {

    this.projectStore.state$.subscribe(project => {

      if (project) {

        this.metadata.setValue({
          name: project.name,
          version: project.version
        }, {
          emitEvent: false
        });
      }
    });
}

  private onMetadataChange(metadata) {

    let projectState = this.projectStore.getState();

    this.projectStore.updateState({
      ...projectState,
      name: metadata.name,
      version: metadata.version
    });
  }
}
