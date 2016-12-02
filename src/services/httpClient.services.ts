import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptionsArgs, Request, Response, ConnectionBackend, RequestOptions} from "@angular/http";
import {Observable} from 'rxjs/Observable';

@Injectable()
export class HttpClient extends Http {

  constructor(protected _backend: ConnectionBackend, protected _defaultOptions: RequestOptions) {

    super(_backend, _defaultOptions);
  }

  _setCustomHeaders(options?: RequestOptionsArgs):RequestOptionsArgs{
    if(!options) {
      options = new RequestOptions({});
    }

    if (!options.headers) {
        options.headers = new Headers();
    }
    options.headers.set("Authorization", "Basic " + btoa("admin:admin"));
    
    return options;
  }


  request(url: string|Request, options?: RequestOptionsArgs): Observable<Response> {
    options = this._setCustomHeaders(options);
    return super.request(url, options)
  }
}