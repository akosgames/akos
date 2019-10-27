import { TreeNode } from './tree-node';
import { SceneService } from '../../core/services/scene.service';

export class ScenesNode implements TreeNode {

  name = 'Scenes';
  children = [];

  constructor(private sceneService: SceneService) {
  }

  createChild() {
    this.sceneService.createScene();
  }
}
