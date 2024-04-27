import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatLineModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ngrx-traits-examples',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Traits examples</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          <mat-list-item [routerLink]="'signals'">
            <div matListItemTitle><b>Signal examples</b></div>
            <div matListItemLine>
              Examples using &#64;ngrx-traits/signals for ngrx-signals
            </div>
          </mat-list-item>
          <mat-list-item [routerLink]="'ngrx'">
            <div matListItemTitle><b>Ngrx examples</b></div>
            <div matListItemLine>Examples using &#64;ngrx-traits for ngrx</div>
          </mat-list-item>
        </mat-list>
      </mat-card-content>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatCardModule,
    MatListModule,
    RouterLink,
    MatLineModule,
    MatDividerModule,
  ],
})
export class ExamplesComponent {}
