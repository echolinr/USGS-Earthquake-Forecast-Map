import {Component, ViewChild} from "@angular/core";
import {MapService} from "../../services/map.service";
import {GeocodingService} from "../../services/geocoding.service";
import {Location} from "../../core/location.class";

@Component({
    templateUrl: "./map.html",
    styleUrls: ['./map.scss']
})
export class MapPage {

    constructor(private mapService: MapService, private geocoder: GeocodingService) {
    }

    ngOnInit() {
        let map = L.map("map", {
            zoomControl: false,
            center: L.latLng(40.731253, -73.996139),
            zoom: 10,
            minZoom: 4,
            maxZoom: 10,
            layers: [this.mapService.baseMaps.CartoDB]
        });

        L.control.zoom({ position: "topright" }).addTo(map);
        L.control.layers(this.mapService.baseMaps).addTo(map);
        L.control.scale().addTo(map);

        L.heatLayer([
            [40.7, -73.9, 0.2], // lat, lng, intensity
            [40.6, -73.8, 0.5]
        ], {radius: 25}).addTo(map);

        this.mapService.map = map;
        this.geocoder.getCurrentLocation()
            .subscribe(
                location => map.panTo([location.latitude, location.longitude]),
                err => console.error(err)
            );
    }
}