import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private updateGameListener = new Subject<any>();
  user = null;
  games = [];
  BNB = 0;
  ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '' },
    // { path: '/game/bombcrypto', title: 'BombCrypto',  icon:'fas fa-bomb', class: '' },
    // { path: '/game/maticverse', title: 'MaticVerse',  icon:'education_atom', class: '' },
    // { path: '/icons', title: 'Icons',  icon:'education_atom', class: '' },
    // { path: '/maps', title: 'Maps',  icon:'location_map-big', class: '' },
    // { path: '/notifications', title: 'Notifications',  icon:'ui-1_bell-53', class: '' },

    // { path: '/user-profile', title: 'User Profile',  icon:'users_single-02', class: '' },
    // { path: '/table-list', title: 'Table List',  icon:'design_bullet-list-67', class: '' },
    // { path: '/typography', title: 'Typography',  icon:'text_caps-small', class: '' },
    // { path: '/upgrade', title: 'Upgrade to PRO',  icon:'objects_spaceship', class: 'active active-pro' }
];
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  getUpdateGameListener() {
    return this.updateGameListener.asObservable();
  }
  getUser() {
    const token = localStorage.getItem('p2eUserToken');
    if (this.user || !token) return;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    });
    this.http.get(`${environment.apiUrl}/user/current`, { headers })
        .subscribe(
          (response) => {
            this.user = response;
          },
          (err) => {
            console.log('🚀 ~ file: user.service.ts ~ line 40 ~ UserService ~ getUser ~ err', err);
          }
        );
  }
  getGames() {
    const token = localStorage.getItem('p2eUserToken');
    if (this.games.length || !token) return;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    });
    this.http.get<any[]>(`${environment.apiUrl}/game/`, { headers })
        .subscribe(
          (response) => {
            this.games = response;
            const games = this.games.map(g => {
              return {
                 path: `/game/${g.name.toLowerCase().replace(/ /g, '')}`, 
                 title: g.name,  
                 icon: 'fas fa-gamepad', 
                 class: '',
                 logo: g.logo !== '/' ? g.logo : null
               }
            });
            this.ROUTES = this.ROUTES.concat(games);
            this.updateGameListener.next(true);
            this.router.navigate(['/']);
          },
          (err) => {
            console.log('🚀 ~ file: user.service.ts ~ line 40 ~ UserService ~ games ~ err', err);
          }
        );
  }
  getBNB() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
    });
      this.http.get<{price: number}>(`https://bsc.api.0x.org/swap/v1/price?sellToken=BNB&buyToken=BUSD&sellAmount=1`, { headers })
          .subscribe(
            (response) => {
                this.BNB = response.price
            },
            (err) => {
              console.log('🚀 ~ file: user.service.ts ~ line 40 ~ UserService ~ response ~ err', err);
            }
          );
  }

}
