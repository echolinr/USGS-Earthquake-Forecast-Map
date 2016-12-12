import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Configuration } from '../app/app.constants';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class ActiveMQService {    
    private activeMQUrl: string = 'activemq'; 

    constructor(private http: Http, private config: Configuration) { 
        this.activeMQUrl = config.ServerWithApiUrl + this.activeMQUrl;
    }

    addEvent(body: Object): Observable<any> {
        let bodyString = JSON.stringify(body);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(this.activeMQUrl + '/comcat', bodyString, options)
            .catch((error: any) => Observable.throw(error.json().message || 'Server error' + error));
    }
}