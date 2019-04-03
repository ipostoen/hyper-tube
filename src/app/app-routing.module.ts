import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AuthGuard } from './_guards';
import { LoginComponent, OauthComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { MovieComponent } from './movie/movie.component';

const routes: Routes = [
  { path: '' , component: MainComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'intra', component: OauthComponent },
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'reset-password/:id', component: ResetPasswordComponent},
  { path: 'movie/:id', component: MovieComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
