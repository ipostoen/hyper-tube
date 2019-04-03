import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordValidation } from '../_helpers';
import { first } from 'rxjs/operators';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  id: String;
  resetForm: FormGroup;
  resetPasswordForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private auth: AuthenticationService
  ) { }

  ngOnInit() {
    this.resetForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });

    this.resetPasswordForm = this.fb.group({
      code: ['', [
        Validators.required
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [
        Validators.required,
      ]]
    }, {validator: PasswordValidation.MatchPassword})

    this.id = this.route.snapshot.params['id'] || null;
  }

  get f() { return this.resetForm.controls; }
  get p() { return this.resetPasswordForm.controls; }

  onSubmit() {

    if (this.resetForm.invalid) { return ; }

    this.auth.sendCode(this.f.email.value)
      .pipe(first())
      .subscribe(data => {
        this.router.navigate(['reset-password', data]);
      }, error => {

      });

  }

  resetPassword() {

    if (this.resetPasswordForm.invalid) { return ; }

    this.auth.resetPassword(this.id, this.p.code.value, this.p.password.value)
      .pipe(first())
      .subscribe(data => {
        this.router.navigate(['/']);
      }, error => {
        if (error === 'Bad code') {
          this.p.code.setErrors({badCode: true})
        }
      })
  }

}
