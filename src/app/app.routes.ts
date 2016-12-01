import { Routes, RouterModule } from '@angular/router';
import { HomePage } from '../pages/home/home';
import { AddEventPage } from '../pages/addEvent/addEvent';
import { NoContentPage } from '../pages/noContent/noContent';


export const ROUTES: Routes = [
  { path: '',      component: HomePage },
  { path: 'home',  component: HomePage },
  { path: 'add-event', component: AddEventPage },
  { path: '**',    component: NoContentPage },
];
