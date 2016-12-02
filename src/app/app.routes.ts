import { Routes, RouterModule } from '@angular/router';
import { HomePage } from '../pages/home/home';
import { EventResultsPage } from '../pages/eventResults/eventResults';
import { ResultDetailsPage } from '../pages/resultDetails/resultDetails';
import { AddEventPage } from '../pages/addEvent/addEvent';
import { NoContentPage } from '../pages/noContent/noContent';


export const ROUTES: Routes = [
  { path: '',      component: HomePage },
  { path: 'home',  component: HomePage },
  { path: 'add-event', component: AddEventPage },
  { path: 'event-results/:id', component: EventResultsPage },
  { path: 'result-details/:id', component: ResultDetailsPage },
  { path: '**',    component: NoContentPage },
];
