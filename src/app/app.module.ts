import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, PreloadAllModules } from '@angular/router';

import { ROUTES } from './app.routes';

import { MaterialModule } from '@angular/material';
import 'hammerjs'; // Angular Material Compatibility

import { MyDateRangePickerModule } from 'mydaterangepicker';

import { USGSApp } from './app.component';

import { PercentageForecastPipe } from './pipes/percentage-forecast.pipe';
import { MmiDisplayPipe } from './pipes/mmi-display.pipe';
import { MinimumOnePipe } from './pipes/minimum-one.pipe';

import { ShakingProbabilityChartComponent } from './components/shaking-probability-chart/shaking-probability-chart.component';
import { ForecastTableComponent } from './components/forecast-table/forecast-table.component';
import { MMIHistogramComponent } from './components/mmi-histogram/mmi-histogram.component';

import { D3Service } from 'd3-ng2-service';
import { GeocodingService } from './services/geocoding.service';
import { MapService } from './services/map.service';
import { SpatialForecastService } from './services/spatial-forecast.service';

import { MapComponent } from './components/map/map.component';

@NgModule({
  declarations: [
    USGSApp,
    PercentageForecastPipe,
    MmiDisplayPipe,
    MinimumOnePipe,
    ShakingProbabilityChartComponent,
    ForecastTableComponent,
    MMIHistogramComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    MyDateRangePickerModule,
    MaterialModule.forRoot(),    
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
  ],
  providers: [
    D3Service,
    GeocodingService,
    MapService,
    SpatialForecastService
  ],
  bootstrap: [USGSApp]
})
export class AppModule { }
