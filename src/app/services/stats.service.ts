import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

constructor( private http: HttpClient  ) { }

  getDailyStats(gameID) {
    const token = localStorage.getItem('p2eUserToken');
    if (!token) return;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(`${environment.apiUrl}/DailyStats/${gameID}`, { headers })
  }
  getEntries(gameID) {
    const token = localStorage.getItem('p2eUserToken');
    if (!token) return;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(`${environment.apiUrl}/entry/${gameID}`, { headers })
  }
  postEntries(entry: any) {
    const token = localStorage.getItem('p2eUserToken');
    if (!token) return;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(`${environment.apiUrl}/entry/`, JSON.stringify(entry), { headers })
  }
  getCurrency(address: string): Promise<number> {
    // sellToken=BNB&buyToken=BUSD
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
      });
      this.http.get<any>(`https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${address}&vs_currencies=usd`, { headers })
          .subscribe(
            (response) => {
              resolve(response[address].usd);
            },
            (err) => {
              reject(err)
            }
          );
    });
  }
  getCurrencyAtDate(tokenID: string, date: any): Promise<number> {
    // sellToken=BNB&buyToken=BUSD
    date = date.toLocaleDateString('es-CL');
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
      });
      this.http.get<any>(`https://api.coingecko.com/api/v3/coins/${tokenID}/history?date=${date}&localization=false`, { headers })
          .subscribe(
            (response) => {
              resolve(response['market_data'].current_price["usd"]);
            },
            (err) => {
              reject(err)
            }
          );
    });
  }
  deepCopy(obj, copy) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || 'object' !== typeof obj) {
      return obj;
    }
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }
    if (obj instanceof Array) {
      copy = [];
      for (let i = 0, len = obj.length; i < len; i++) {
         this.deepCopy(obj[i], copy[i]);
      }
      return copy;
    }
    if (obj instanceof Object) {
      copy = {};
      for (const attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          this.deepCopy(obj[attr], copy[attr]);
        }
      }
      return copy;
    }

    throw new Error('Unable to copy obj! type is not supported.');
  }
}
