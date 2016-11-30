import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../pages/home';
import { NoContentComponent } from '../pages/no-content';


export const ROUTES: Routes = [
  { path: '',      component: HomeComponent },
  { path: 'home',  component: HomeComponent },
  { path: 'about', component: HomeComponent },
  { path: '**',    component: NoContentComponent },
];
