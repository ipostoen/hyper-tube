import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { AuthenticationService } from '../_services';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
declare const gapi: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string;
  public auth2: any;

  constructor(
    private auth: AuthenticationService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone) { }

  public googleInit() {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: '692909780045-iufoaoag1n50vn4hg8154tr4gdskuebi.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        scope: 'profile email'
      });
      this.attachSignin(document.getElementById('googleBtn'));
    });
  }
  public attachSignin(element) {
    this.auth2.attachClickHandler(element, {},
      (googleUser) => {

        let profile = googleUser.getBasicProfile();
        let user = {
          token: googleUser.getAuthResponse().id_token,
          name: profile.getName(),
          email: profile.getEmail(),
        }
        this.auth.googleAuth(user)
          .pipe(first())
          .subscribe(
            data => {
              this.navigate();
            },
            error => {
              // console.log(error);
            });

      }, (error) => {
        alert(JSON.stringify(error, undefined, 2));
      });
  }

  ngAfterViewInit() {
    this.googleInit();
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });

    this.auth.logout();

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  navigate() {
    this.ngZone.run(() => this.router.navigate([this.returnUrl])).then();
  }
  
  loginIntra() {
    window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=792b479c6c3a8b2aa6bd91ffbdef3389771b05a64c1d62b380ede7f7667f7320&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fintra&response_type=code";
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.auth.login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        data => {
          this.navigate();
        },
        error => {
          // console.log(error);
        });
  }

}

@Component({
  selector: 'app-oauth',
  template: ""
})
export class OauthComponent implements AfterViewInit {
  error: string;
  code: string;

  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone) {
    
  }



  ngAfterViewInit() {
    this.code = this.route.snapshot.queryParamMap.get('code') || null;
    this.error = this.route.snapshot.queryParamMap.get('error') || null;

    if (this.error !== null) {
      this.ngZone.run(() => this.router.navigate(['/login'])).then();
    } else if (this.code !== null) {
      this.auth.intraAuth(this.code)
      .pipe(first())
      .subscribe(
        data => {
          this.ngZone.run(() => this.router.navigate(['/'])).then();
        },
        err => {
          this.ngZone.run(() => this.router.navigate(['/'])).then();
        }
      )
    } else if (this.code === null && this.error === null) {
      this.ngZone.run(() => this.router.navigate(['/login'])).then();
    }

  }
}
