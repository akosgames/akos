import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MetadataView } from './metadata/metadata.view';
import { SceneView } from './scene/scene.view';
import { WelcomeView } from './layout/views/welcome/welcome.view';
import { ProjectGuard } from './core/guards/project.guard';

const routes: Routes = [
  {path: '', redirectTo: '/welcome', pathMatch: 'full'},
  {path: 'welcome', component: WelcomeView},
  {path: 'metadata', component: MetadataView, canActivate: [ProjectGuard]},
  {path: 'scene/:id', component: SceneView, canActivate: [ProjectGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
