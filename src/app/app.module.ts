import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http, RequestOptions, XHRBackend } from '@angular/http';
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
import { ActiveMQService } from '../services/activemq.services';

import { HomePage } from '../pages/home/home';
import { AddEventPage } from '../pages/addEvent/addEvent';
import { NoContentPage } from '../pages/noContent/noContent';

/*function httpClientFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions): Http {
  return new HttpClient(xhrBackend, requestOptions);
}*/
/*function httpClientFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions) {
  return new HttpService(xhrBackend, requestOptions);
}*/

const APP_PROVIDERS = [
  Configuration,
  AftershockService,
  ActiveMQService
];

@NgModule({
  bootstrap: [ USGSApp ],
  declarations: [
    USGSApp,
    HomePage,
    AddEventPage,
    NoContentPage,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    MaterialModule.forRoot(),
    Ng2SelectModule
  ],
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS,
    //{ provide: Http, useFactory: httpClientFactory, deps: [XHRBackend, RequestOptions]}
    //{ provide: HttpService, useFactory: httpClientFactory, deps: [XHRBackend, RequestOptions]}
  ]
})
export class AppModule {}

