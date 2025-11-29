import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { serverRoutes } from './app/app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

const mergedConfig = mergeApplicationConfig(appConfig, serverConfig);

const bootstrap = () => bootstrapApplication(AppComponent, mergedConfig);

export default bootstrap;
