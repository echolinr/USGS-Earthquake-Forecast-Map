import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../pages/home';
import { AboutComponent } from '../pages/about';
import { NoContentComponent } from '../pages/no-content';

import { DataResolver } from '../services/app.resolver';


export const ROUTES: Routes = [
  { path: '',      component: HomeComponent },
  { path: 'home',  component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'detail', loadChildren: () => System.import('../pages/+detail')
      .then((comp: any) => comp.default),
  },
  { path: '**',    component: NoContentComponent },
];
