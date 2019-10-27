import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatRippleModule,
  MatToolbarModule,
  MatTreeModule
} from '@angular/material';
import { ToolbarContainer } from './containers/toolbar/toolbar.container';
import { CoreModule } from '../core/core.module';
import { SidebarContainer } from './containers/sidebar/sidebar.container';
import { NodeComponent } from './components/node/node.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    NodeComponent,
    SidebarContainer,
    ToolbarContainer
  ],
  imports: [
    CommonModule,
    CoreModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    MatToolbarModule,
    MatTreeModule
  ],
  exports: [
    SidebarContainer,
    ToolbarContainer
  ]
})
export class LayoutModule {
}
