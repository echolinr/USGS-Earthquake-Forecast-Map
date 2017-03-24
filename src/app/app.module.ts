import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http, RequestOptions, XHRBackend, JsonpModule} from '@angular/http';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { MaterialModule } from '@angular/material';
//import { HttpClient } from '../services/httpClient.services';
//import { HttpService } from '../services/http.services';

import 'hammerjs';
import { Ng2SelectModule } from 'ng2-material-select';

import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';

import { USGSApp } from './app.component';
import { Configuration } from './app.constants';
import { AftershockService } from '../services/aftershock.services';
import { PDLService } from '../services/pdl.services';
import { ResultService } from '../services/result.services';
import { ActiveMQService } from '../services/activemq.services';


import { MapService } from '../services/map.service';
import { GeocodingService } from '../services/geocoding.service';

import { HomePage } from '../pages/home/home';
import { AddEventPage } from '../pages/addEvent/addEvent';
import { PdlRegionPage } from '../pages/pdl/pdl';
import { EventResultsPage } from '../pages/eventResults/eventResults';
import { ResultDetailsPage } from '../pages/resultDetails/resultDetails';
import { NoContentPage } from '../pages/noContent/noContent';

import { MapPage } from '../pages/map/map';
import { DisclaimerPage} from '../pages/disclaimer/disclaimer';

import { MyDateRangePickerModule } from 'mydaterangepicker';
import { SpatialForcastService } from "../services/spatialforcast.service";

/*function httpClientFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions): Http {
  return new HttpClient(xhrBackend, requestOptions);
}*/
/*function httpClientFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions) {
  return new HttpService(xhrBackend, requestOptions);
}*/

const APP_PROVIDERS = [
  Configuration,
  AftershockService,
  PDLService,
  ResultService,
  ActiveMQService,
  MapService,
  GeocodingService,
  SpatialForcastService
];

@NgModule({
  bootstrap: [ USGSApp ],
  declarations: [
    USGSApp,
    HomePage,
    AddEventPage,
    PdlRegionPage,
    EventResultsPage,
    ResultDetailsPage,
    NoContentPage,
    MapPage,
    DisclaimerPage,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MyDateRangePickerModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    MaterialModule.forRoot(),
    Ng2SelectModule,
    JsonpModule
  ],
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS,
    //{ provide: Http, useFactory: httpClientFactory, deps: [XHRBackend, RequestOptions]}
    //{ provide: HttpService, useFactory: httpClientFactory, deps: [XHRBackend, RequestOptions]}
  ]
})
export class AppModule {}

