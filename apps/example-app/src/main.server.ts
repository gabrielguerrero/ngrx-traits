import { bootstrapApplication } from '@angular/platform-browser';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { serverRoutes } from './app/app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

const mergedConfig = mergeApplicationConfig(appConfig, serverConfig);

const bootstrap = () => bootstrapApplication(AppComponent, mergedConfig);

export default bootstrap;
export { serverRoutes };
