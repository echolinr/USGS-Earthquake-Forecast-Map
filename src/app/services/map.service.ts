import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Map} from "leaflet";

@Injectable()
export class MapService {
    public map: Map;
    public baseMaps: any;

    constructor(private http: Http) {
        this.baseMaps = {
            CartoDB: L.tileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">USGS</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            }),
            USFault: L.tileLayer("https://earthquake.usgs.gov/basemap/tiles/faults/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">USGS</a>'
            })
        };
    }
}