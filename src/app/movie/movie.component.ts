import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MoviesService, AuthenticationService } from '../_services'
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Movie, Comment } from '../_models';


@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieComponent implements OnInit {
  id: String;
  movie: Movie;
  comment: Array<Comment>;
  streamUrl: String;
  quality: String;
  commentsForm: FormGroup;

  @ViewChild('video') video: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moviesService: MoviesService,
    private auth: AuthenticationService,
    private fb: FormBuilder
  ) {  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'] || null;

    if (!this.id) {
      this.router.navigate(['movies']);
    }

    this.moviesService.getMovieById(this.id)
    .pipe(first())
    .subscribe((data: any) => {
      this.movie = data;
      console.log(this.movie);
      if (data.torrents) {
        this.quality = '720';
        this.streamUrl = `http://localhost:3000/api/movies/stream/${encodeURIComponent(this.movie.torrents.en['720p'].url)}?`+
      `x_auth=${this.auth.currentUserValue.token}`;
      }
    }, err => {
      console.log(err);
    });

    this.moviesService.getComment(this.id)
    .pipe(first())
    .subscribe((data: any) => {
      console.log(data);
      this.comment = data;
    }, err => {
      
    })

    this.commentsForm = this.fb.group({
      comment: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(1000)
      ]]
    });
  }

  get image() {
    if (this.movie) {
      return this.movie.backdrop_path;
    }
  }

  get poster() {
    let url = `http://image.tmdb.org/t/p/original${this.movie.poster_path}`;

    return url;
  }

  get date() {
    let date: String;
    if (this.movie) {
      date = this.movie.release_date.split('-')[0];
    }
    return date;
  }

  get f() { return this.commentsForm.controls; }

  setQuality(q) {
    if (this.quality != q && q === '720') {
      this.quality = q;
      this.streamUrl = `http://localhost:3000/api/movies/stream/${encodeURIComponent(this.movie.torrents.en['720p'].url)}?`+
      `x_auth=${this.auth.currentUserValue.token}`;
    } else if (this.quality != q && q === '1080') {
      this.quality = q;
      this.streamUrl = `http://localhost:3000/api/movies/stream/${encodeURIComponent(this.movie.torrents.en['1080p'].url)}?`+
      `x_auth=${this.auth.currentUserValue.token}`;
    }
  }

  sendComments() {
    if (this.commentsForm.invalid) {
      return ;
    }

    this.moviesService.sendComment(this.f.comment.value, this.id)
    .pipe(first())
    .subscribe(data => {
      this.comment.push({
        filmId: this.id,
        comment: this.f.comment.value,
        userId: {
          firstname: this.auth.currentUserValue.firstname,
          lastname: this.auth.currentUserValue.lastname,
        }
      });
      this.f.comment.setValue(''); 
    }, err => {

    })
  }

}
