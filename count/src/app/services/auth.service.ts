import { Injectable, signal } from '@angular/core'
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { ToastrService } from 'ngx-toastr'
import { IAuthUser, IUser } from '../types/user.interface';
import { API_URL } from '../constants/constants';
import { catchError, tap } from 'rxjs';



@Injectable({
	providedIn: 'root',
})
export class AuthService {

  isAuthSig = signal<boolean>(true)

	constructor(
		private readonly http: HttpClient,
		private readonly router: Router,
		private readonly toastr: ToastrService
	) {
    const token = localStorage.getItem('token')
    this.isAuthSig.set(!!token)
  }

	signUp(userData: IAuthUser) {
		return this.http
			.post(`${API_URL}/user`, userData)
			.pipe(
        tap(() => {
          this.login(userData)
        }),

				catchError(err => {
					this.handleError(err)
					throw new Error(err.message)
				})
			)
			.subscribe(() => this.toastr.success('created'))
	}

  login(userData: IAuthUser) {
    return this.http
    .post<IUser>(`${API_URL}/auth/login`, userData)
    .pipe(
      tap((res: IUser) => {
        localStorage.setItem('token', res.token)
        this.isAuthSig.set(true)
      }),

      catchError((err) => {
				this.handleError(err)
				throw new Error(err.message)
			})
    )
    .subscribe(() => this.toastr.success('logged in'))
  }

	private handleError(err: HttpErrorResponse): void {
		this.toastr.error(err.error.message)
	}
} 