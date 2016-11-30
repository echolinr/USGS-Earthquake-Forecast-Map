import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { MaterialModule } from '@angular/material';

import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';

import { USGSApp } from './app.component';
import { Configuration } from './app.constants';
import { AftershockService } from '../services/aftershock.services';

import { HomeComponent } from '../pages/home';
import { NoContentComponent } from '../pages/no-content';

const APP_PROVIDERS = [
  Configuration,
  AftershockService
];

@NgModule({
  bootstrap: [ USGSApp ],
  declarations: [
    USGSApp,
    HomeComponent,
    NoContentComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules }),
    MaterialModule.forRoot()
  ],
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {}

