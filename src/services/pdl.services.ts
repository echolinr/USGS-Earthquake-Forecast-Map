import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Configuration } from '../app/app.constants';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class PDLService {    
    private brandUrl: string = 'pdl'; 

    constructor(private http: Http, private config: Configuration) { 
        this.brandUrl = config.ServerWithApiUrl + this.brandUrl;
    }

    getLastPDLFilters(): Observable<any[]> {
        return this.http.get(this.brandUrl + '/filters')
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
    }

}