import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http, RequestOptions, XHRBackend, JsonpModule} from '@angular/http';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { MaterialModule } from '@angular/material';

import 'hammerjs';

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


import { TestD3Component } from '../pages/example/example';
import { D3Service } from 'd3-ng2-service';

import { MyDateRangePickerModule } from 'mydaterangepicker';
import { SpatialForcastService } from "../services/spatialforcast.service";


import { ForecastTableComponent } from '../components/forecast-table/forecast-table.component';
import { MMIHistogramComponent } from '../components/mmi-histogram/mmi-histogram.component';
import { ShakingProbabilityChartComponent } from '../components/shaking-probability-chart/shaking-probability-chart.component';


const APP_PROVIDERS = [
  Configuration,
  AftershockService,
  PDLService,
  ResultService,
  ActiveMQService,
  MapService,
  GeocodingService,
  D3Service,
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
    TestD3Component,
    MMIHistogramComponent,
    ForecastTableComponent,
    ShakingProbabilityChartComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MyDateRangePickerModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    MaterialModule.forRoot(),
    JsonpModule
  ],
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {}

