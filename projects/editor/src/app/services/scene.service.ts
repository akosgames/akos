import { Injectable } from '@angular/core';
import { generateId } from '../utils/node';
import { CollectionService } from 'akos-common/utils/service/collection.service';
import { Scene } from '../types/scene';

@Injectable({
  providedIn: 'root'
})
export class SceneService extends CollectionService<Scene> {

  createScene(): number {

    let id = generateId();
    this.addItem({
      id: id,
      name: 'New scene'
    });

    return id;
  }

  updateScene(scene: Scene) {
    this.updateItem(scene);
  }

  deleteScene(sceneId: number) {
    this.removeItem(sceneId.toString());
  }
}
