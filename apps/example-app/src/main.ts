import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// uncomment bellow to use msw to mock backend
// import './app/examples/services/mock-backend';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
