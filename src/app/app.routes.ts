import { Routes, RouterModule } from '@angular/router';
import { HomePage } from '../pages/home/home';
import { EventResultsPage } from '../pages/eventResults/eventResults';
import { ResultDetailsPage } from '../pages/resultDetails/resultDetails';
import { AddEventPage } from '../pages/addEvent/addEvent';
import { PdlRegionPage } from '../pages/pdl/pdl';
import { NoContentPage } from '../pages/noContent/noContent';
import { MapPage } from '../pages/map/map';
import { DisclaimerPage } from '../pages/disclaimer/disclaimer';
import { TestD3Component } from '../pages/example/example';


export const ROUTES: Routes = [
  { path: '',      component: HomePage },
  { path: 'home',  component: HomePage },
  { path: 'map',  component: MapPage },
  { path: 'example',  component: TestD3Component },
  { path: 'disclaimer', component: DisclaimerPage},
  { path: 'add-event', component: AddEventPage },
  { path: 'pdl', component: PdlRegionPage },
  { path: 'event-results/:id', component: EventResultsPage },
  { path: 'result-details/:id', component: ResultDetailsPage },
  { path: '**',    component: NoContentPage },
];
