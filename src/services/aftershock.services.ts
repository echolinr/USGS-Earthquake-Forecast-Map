import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Configuration } from '../app/app.constants';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class AftershockService {    
    private brandUrl: string = 'aftershocks'; 

    constructor(private http: Http, private config: Configuration) { 
        this.brandUrl = config.ServerWithApiUrl + this.brandUrl;
    }

    getLastAftershocks(): Observable<any[]> {
        return this.http.get(this.brandUrl + '/lasts')
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
    }

    getLastAftershocksById(id): Observable<any[]> {
        return this.http.get(this.brandUrl + '/lasts/' + id)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
    }

}