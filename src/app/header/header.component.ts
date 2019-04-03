import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { map, first } from 'rxjs/operators';
import { AuthenticationService } from '../_services';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  canActive: boolean;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthenticationService,
    private router: Router) {
      if (this.authService.currentUserValue) {
        this.canActive = true;
      } else {
        this.canActive = false;
      }
    }

  logout() {
    this.authService.logout().pipe(first())
    .subscribe(
      data => {
        this.router.navigate(['/login']);
      },
      error => {
        // console.log(error);
    });;
  }

}
