import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
// import { environment } from 'src/environments/environment';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  private token = '';
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();
  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string {
    return this.token;
  }

  getIsAuth(): boolean {
    return this.isAuthenticated;
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  createUser(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders().set('Content-Type', 'application/json');
      const authData = JSON.stringify(data);
      this.http
        .post(`${environment.apiUrl}/auth/register`, authData, { headers })
        .subscribe(
          (response) => {
            resolve(response);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  login(data: any): Promise<any> {
    const rememberMe = data['rememberMe'];
    delete data['rememberMe'];
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const authData = JSON.stringify(data);
    return new Promise((resolve, reject) => {
      this.http
        .post<{ token: string; expiresIn: number }>(
          `${environment.apiUrl}/auth/login`,
          authData,
          { headers }
        )
        .subscribe(
          (response) => {
            const token = response.token;
            this.token = token;
            if (token) {
              // const now = new Date();
              // const info = this.getInfoFromToken(token);
              // const expiresInDuration = info.exp * 1000 - now.getTime();
              // this.setAuthTimer(expiresInDuration);
              // this.isAuthenticated = true;
              // this.authStatusListener.next(true);
              // // const now = new Date();
              // const expirationDate = new Date(info.exp * 1000);
              // console.log(expirationDate);
              this.saveAuthData(token, null,rememberMe);
            }
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  autoAuthUser(): void {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout(): void {
    this.token = '';
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number): void {
    console.log('Setting timer: ', duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(
    token: string,
    expirationDate?: Date,
    rememberMe?: boolean
  ): void {
    // if (rememberMe) {
    //   localStorage.setItem('token', token);
    //   localStorage.setItem('expiration', expirationDate.toISOString());
    // } else {
    //   sessionStorage.setItem('token', token);
    //   sessionStorage.setItem('expiration', expirationDate.toISOString());
    // }
    localStorage.setItem('p2eUserToken', token);
    // localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('expiration');
  }

  private getAuthData(): any {
    let token = localStorage.getItem('token');
    let expirationDate = localStorage.getItem('expiration');
    if (!token || !expirationDate) {
      token = sessionStorage.getItem('token');
      expirationDate = sessionStorage.getItem('expiration');
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
    };
  }
  /**
   * this function is used to get info from jwt token
   */
  getInfoFromToken(jwt: string): any {
    const token = jwt.split('.');
    if (!token || !token?.length) {
      return '';
    }
    const main = atob(token[1]);
    const info = JSON.parse(main);
    return info;
  }
}
