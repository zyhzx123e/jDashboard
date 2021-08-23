
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MainComponent } from "./pages/main/main.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { CanActivateGuard } from './can-activate-guard.guard';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginModule),
    data: {
      preload: true
    }
  },
  {
    path: "main",
    component: MainComponent,
    children: [
      {
        path: "",
        component: DashboardComponent,
      },
    ],
    canActivate: [CanActivateGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
