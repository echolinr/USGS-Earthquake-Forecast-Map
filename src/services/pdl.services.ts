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

    getPDLFilters(): Observable<any[]> {
        return this.http.get(this.brandUrl + '/filters')
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
    }

    addPDLFilter(body: Object): Observable<any> {
        let bodyString = JSON.stringify(body);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(this.brandUrl + '/filters', bodyString, options)
            .map((res: Response) => {console.log('res', res);res.json()})
            .catch((error: any) => Observable.throw(error.json().message || 'Server error' + error));
    }

    deletePDLFilter(filterName: string): Observable<any> {
        return this.http.delete(this.brandUrl + '/filters/' + filterName)
            .map((res: Response) => {console.log('res', res);res.json()})
            .catch((error: any) => Observable.throw(error.json().message || 'Server error' + error));
    }

}