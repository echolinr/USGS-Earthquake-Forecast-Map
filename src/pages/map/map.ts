import {Component, ViewChild, ElementRef, animate, OnDestroy} from "@angular/core";
import {MapService} from "../../services/map.service";
import {GeocodingService} from "../../services/geocoding.service";
import {Location} from "../../core/location.class";
import {Subscription} from "rxjs";
import {Router, ActivatedRoute} from "@angular/router";

declare var google: any;

@Component({
  templateUrl: "./map.html",
  styleUrls: ['./map.scss']
})
export class MapPage implements OnDestroy {
  private subscription: Subscription;
  private mapZoom: number = 12;
  private mapScale: string;
  private centerLat: number = 40.731253;
  private centerLng: number = -73.996139;
  private hasParams: boolean = false;

  autocompleteItems: any;
  autocomplete: any;
  acService: any;
  map: any;

    constructor(private mapService: MapService, private geocoder: GeocodingService,
                private activatedRoute: ActivatedRoute, private router: Router) {
      this.subscription = activatedRoute.queryParams.subscribe(
        (queryParam: any) =>  {
          if(queryParam['lat']) {
            this.centerLat = Number.parseFloat(queryParam['lat']);
            this.centerLng = Number.parseFloat(queryParam['lng']);
            this.mapZoom = Number.parseInt(queryParam['zoomLevel']);
            this.hasParams = true;
          }
        }
      );
    }

    ngOnInit() {
      this.map = L.map("map", {
            zoomControl: false,
            center: L.latLng(this.centerLat, this.centerLng),
            zoom: this.mapZoom,
            minZoom: 4,
            maxZoom: 10,
            layers: [this.mapService.baseMaps.CartoDB]
        });

        L.control.zoom({ position: "topright" }).addTo(this.map);
        L.control.layers(this.mapService.baseMaps).addTo(this.map);
        L.control.scale().addTo(this.map);

        L.heatLayer([
            [40.7, -73.9, 0.2], // lat, lng, intensity
            [40.6, -73.8, 0.5]
        ], {radius: 25}).addTo(this.map);

        this.mapService.map = this.map;
        if (!this.hasParams) {
          this.geocoder.getCurrentLocation()
            .subscribe(
              location => this.map.panTo([location.latitude, location.longitude]),
              err => console.error(err)
            );
        }

        this.acService = new google.maps.places.AutocompleteService();
        this.autocompleteItems = [];
        this.autocomplete = {
          query: ''
        };

        this.map.on('zoomend', () => {
          this.mapZoom = this.map.getZoom();
          this.centerLat = this.map.getCenter().lat;
          this.centerLng = this.map.getCenter().lng;
          this.mapScale = this.scaleLookup(this.mapZoom);
          this.router.navigate(['map'],{queryParams:{'lat':this.centerLat, 'lng':this.centerLng, 'zoomLevel':this.mapZoom}});
        });

        this.map.on('mousemove', () => {
          this.mapZoom = this.map.getZoom();
          this.centerLat = this.map.getCenter().lat;
          this.centerLng = this.map.getCenter().lng;
          this.router.navigate(['map'],{queryParams:{'lat':this.centerLat, 'lng':this.centerLng, 'zoomLevel':this.mapZoom}});
        })
    }


  updateSearch() {
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      return;
    }

    let self = this;

    let config = {
      input: this.autocomplete.query
    }

    this.acService.getPlacePredictions(config, function (predictions, status) {
      self.autocompleteItems = [];
      if (typeof predictions !== 'undefined') {
        predictions.forEach(function (prediction) {
          self.autocompleteItems.push(prediction);
        });
      }
    });
  }

  moveMap(place: any) {
    let self = this;
    self.autocomplete.query = place.description;
    let place_id = place.place_id;
    let geocoder = new google.maps.Geocoder;
    geocoder.geocode({'placeId': place_id}, function (results, status) {
      if (status === 'OK') {
        if (results[0]) {
          let location = results[0].geometry.location;
          let latlng = L.latLng(location.lat(), location.lng());
          self.map.setView(latlng, 10, {animation: true});
        } else {
          console.log(status);
        }
      } else {
        console.log(status);
      }
    });
  }

    ngOnDestroy() {
      this.subscription.unsubscribe();
    }

    scaleLookup(mapZoom: number) {
      switch (mapZoom) {
        case 19:
          return '1,128';
        case 18:
          return '2,256';
        case 17:
          return '4,513';
        case 16:
          return '9,027';
        case 15:
          return '18,055';
        case 14:
          return '36,111';
        case 13:
          return '72,223';
        case 12:
          return '144,447';
        case 11:
          return '288,895';
        case 10:
          return '577,790';
        case 9:
          return '1,155,581';
        case 8:
          return '2,311,162';
        case 7:
          return '4,622,324';
        case 6:
          return '9,244,649';
        case 5:
          return '18,489,298';
        case 4:
          return '36,978,596';
        case 3:
          return '73,957,193';
        case 2:
          return '147,914,387';
        case 1:
          return '295,828,775';
        case 0:
          return '591,657,550';
      }
  }
}
