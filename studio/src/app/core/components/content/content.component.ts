import {Component, OnInit} from '@angular/core';
import {ProjectNode} from '../../models/project-node';
import {UiService} from '../../services/ui.service';
import {GameDescriptorService} from '../../services/game-descriptor.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  openNodes: ProjectNode[];
  activeNode: ProjectNode;

  constructor(private uiService: UiService, private gameDescriptorService: GameDescriptorService) {
    uiService.subscribeNodeOpen(node => this.onNodeOpen(node));
    uiService.subscribeNodeDeleted(node => this.onNodeDeleted(node));
    gameDescriptorService.subscribeGameDescriptorLoaded(() => this.closeAll());
  }

  ngOnInit() {
    this.openNodes = [];
  }

  onClose(node: ProjectNode): void {

    let nodeIndex = this.openNodes.indexOf(node);
    this.openNodes.splice(nodeIndex, 1);

    if (this.activeNode === node) {
      let activeIndex = nodeIndex < this.openNodes.length ? nodeIndex : this.openNodes.length - 1;
      this.activeNode = this.openNodes[activeIndex];
    }
  }

  private onNodeOpen(node: ProjectNode): void {

    if (this.openNodes.indexOf(node) < 0) {
      this.openNodes.push(node);
    }

    this.activeNode = node;
  }

  private onNodeDeleted(node: ProjectNode): void {
    this.onClose(node);
  }

  private closeAll(): void {
    this.openNodes = [];
    this.activeNode = null;
  }
}
