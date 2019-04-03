import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MoviesService {

    constructor(
        private http: HttpClient
    ) {}

    getMovieById(id) {
        let url = `http://localhost:3000/api/movies/${id}`;
        return this.http.get(url, {observe: 'response'})
        .pipe(map((res) => {
            return res.body;           
        }));
    }

    sendComment(comment: String, filmId: String) {
        return this.http.post('http://localhost:3000/api/comment/', { comment, filmId }, {observe: 'response'})
        .pipe(map((res) => {

        }));
    }

    getComment(id) {
        return this.http.get(`http://localhost:3000/api/comment/${id}`, { observe: 'response' })
        .pipe(map((res) => {
            return res.body;
        }));
    }


}