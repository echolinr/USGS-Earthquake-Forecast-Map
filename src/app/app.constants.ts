import { Injectable } from '@angular/core';

@Injectable()
export class Configuration {
    public Server: string = "http://localhost:8080/";
    public ApiUrl: string = "api/";
    public ServerWithApiUrl = this.Server + this.ApiUrl;

    constructor() {        
        if ('production' === ENV) {
                this.Server = "http://10.214.2.47:8080/";
                this.ServerWithApiUrl = this.Server + this.ApiUrl;
        }
     }
}