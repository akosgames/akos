import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TreeNode } from '../../types/nodes/tree.node';

@Component({
  selector: 'ak-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss']
})
export class NodeComponent implements OnInit {

  @Input() node: TreeNode;
  @Input() expanded: boolean;

  @Output() create = new EventEmitter<TreeNode>();
  @Output() toggleExpand = new EventEmitter<TreeNode>();

  constructor() {
  }

  ngOnInit() {
  }

  isParent() {
    return !!this.node.children;
  }

  isExpandable() {
    return this.node.children.length > 0;
  }

  onCreate(event) {
    event.stopPropagation();
    this.create.emit(this.node);
  }

  onToggleExpand(event) {
    event.stopPropagation();
    if (this.isExpandable()) {
      this.toggleExpand.emit(this.node);
    }
  }
}
