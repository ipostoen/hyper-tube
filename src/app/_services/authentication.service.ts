import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    register(username:string, lastname: string, firstname: string, email: string, password: string) {
        return this.http.post<any>(`http://localhost:3000/api/user`, { username, lastname, firstname, email, password }, { observe: 'response' })
            .pipe(map((res) => {
                
            }));

    }

    googleAuth(user: Object) {
        return this.http.post<any>(`http://localhost:3000/api/user/googleAuth`, user, { observe: 'response'})
        .pipe(map((res) => {
            let user = res.body;
            user.token = res.headers.get('x-auth');
            if (user && user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            }
            return user;
        }));
    }

    intraAuth(code: string) {
        return this.http.post<any>('http://localhost:3000/api/user/intraAuth', { code }, {observe: 'response'})
        .pipe(map((res) => {
            let user = res.body;
            user.token = res.headers.get('x-auth');
            if (user && user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            }
            return user;
        }));
    }

    login(username: string, password: string) {
        return this.http.post<any>(`http://localhost:3000/api/user/login`, { username, password }, { observe: 'response' })
            .pipe(map((res) => {
                let user = res.body;
                user.token = res.headers.get('x-auth');
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            }));
    }

    logout() {
        return this.http.delete<any>(`http://localhost:3000/api/user/logout`, { observe: 'response' })
            .pipe(map((res) => {
                if (res.status === 200) {
                    localStorage.removeItem('currentUser');
                    this.currentUserSubject.next(null);
                }
            }));
    }

    sendCode(email) {
        return this.http.post<any>('http://localhost:3000/api/user/refreshPassword', { email }, { observe: 'response' })
            .pipe(map((res) => {
                if (res.status === 200) {
                    return res.body;
                }
            }))
    }

    resetPassword(id, code, password) {
        return this.http.post<any>('http://localhost:3000/api/user/newPassword', { id, code, password}, { observe: 'response'})
            .pipe(map((res) => {
                if (res.status === 200) {
                    return res.body;
                }
            }));
    }
}