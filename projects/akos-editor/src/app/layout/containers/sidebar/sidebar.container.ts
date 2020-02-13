import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { TreeNode } from '../../types/tree-node';
import { MetadataNode } from '../../types/metadata-node';
import { ScenesNode } from '../../types/scenes-node';
import { SceneNode } from '../../types/scene-node';
import { Router } from '@angular/router';
import { SceneService } from '../../../services/scene.service';
import { Scene } from 'akos-common';

@Component({
  selector: 'ak-sidebar',
  templateUrl: './sidebar.container.html',
  styleUrls: ['./sidebar.container.scss']
})
export class SidebarContainer implements OnInit {

  treeControl: NestedTreeControl<TreeNode>;
  dataSource: MatTreeNestedDataSource<TreeNode>;

  private readonly metadata: MetadataNode;
  private readonly scenes: ScenesNode;

  constructor(
    private router: Router,
    private sceneService: SceneService
  ) {

    this.treeControl = new NestedTreeControl<TreeNode>(node => node.children);
    this.dataSource = new MatTreeNestedDataSource<TreeNode>();

    this.metadata = new MetadataNode();
    this.scenes = new ScenesNode(this.sceneService);
  }

  ngOnInit() {

    this.dataSource.data = [
      this.metadata,
      this.scenes
    ];

    this.sceneService.getObservable().subscribe(scenes => this.updateScenes(scenes));
  }

  isParent(index: number, node: TreeNode) {
    return !!node.children;
  }

  isExpanded(node: TreeNode) {
    return this.treeControl.isExpanded(node);
  }

  onCreate(node: TreeNode) {

    let childRoute = node.createChild();
    this.router.navigateByUrl(childRoute);

    if (!this.isExpanded(node)) {
      this.treeControl.expand(node);
    }
  }

  onToggleExpand(node: TreeNode) {
    this.treeControl.toggle(node);
  }

  private updateTree() {

    let data = this.dataSource.data;

    this.dataSource.data = null;
    this.dataSource.data = data;

    this.checkCurrentRoute();
  }

  private checkCurrentRoute() {

    let displayedNodeStillExists = this.dataSource.data.some(node =>
      this.router.url === node.route
      || node.children && node.children.some(child => this.router.url === child.route)
    );

    if (!displayedNodeStillExists) {
      this.router.navigateByUrl('');
    }
  }

  private updateScenes(scenes: Scene[]) {

    this.scenes.children = scenes.map(scene => new SceneNode(scene.id, scene.name));
    this.updateTree();

    if (scenes.length === 0) {
      this.treeControl.collapse(this.scenes);
    }
  }
}
