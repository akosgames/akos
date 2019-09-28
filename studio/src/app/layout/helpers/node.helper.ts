import {Node} from '../types/node';
import {Scene} from '../../core/types/scene';
import * as SceneActions from '../../core/store/actions/scene.actions';
import {copyNode, generateId} from '../../shared/utils/node';

export class NodeHelper {

  public static getMetadataNode(): Node {
    return {
      id: 'metadata',
      name: 'Game metadata',
      icon: 'list_alt'
    };
  }

  public static getScenesParentNode(): Node {
    return {
      id: 'scenes',
      name: 'Scenes',
      children: [],
      getCreateAction: () => SceneActions.addScene({scene: {id: generateId(), name: 'New scene'}}),
    };
  }

  public static getScenesNodes(scenes: Scene[]): Node[] {

    let nodes: Node[] = [];

    for (let scene of scenes) {
      nodes.push({
        id: scene.id.toString(),
        name: scene.name,
        icon: 'movie_creation',
        getCopyAction: () => SceneActions.addScene({scene: {...copyNode(scene), name: scene.name + ' copy'}}),
        getDeleteAction: () => SceneActions.deleteScene({id: scene.id})
      });
    }

    return nodes;
  }
}
