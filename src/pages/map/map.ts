import {Component, ViewChild, ElementRef, animate} from "@angular/core";
import {MapService} from "../../services/map.service";
import {GeocodingService} from "../../services/geocoding.service";
import {Location} from "../../core/location.class";

declare var google: any;

@Component({
  templateUrl: "./map.html",
  styleUrls: ['./map.scss']
})
export class MapPage {

  autocompleteItems: any;
  autocomplete: any;
  acService: any;
  map: any;

  constructor(private mapService: MapService, private geocoder: GeocodingService) {
  }

  ngOnInit() {
    this.map = L.map("map", {
      zoomControl: false,
      center: L.latLng(40.731253, -73.996139),
      zoom: 10,
      minZoom: 4,
      maxZoom: 10,
      layers: [this.mapService.baseMaps.CartoDB]
    });

    L.control.zoom({position: "topright"}).addTo(this.map);
    L.control.layers(this.mapService.baseMaps).addTo(this.map);
    L.control.scale().addTo(this.map);

    L.heatLayer([
      [40.7, -73.9, 0.2], // lat, lng, intensity
      [40.6, -73.8, 0.5]
    ], {radius: 25}).addTo(this.map);

    this.mapService.map = this.map;
    this.geocoder.getCurrentLocation()
      .subscribe(
        location => this.map.panTo([location.latitude, location.longitude]),
        err => console.error(err)
      );

    this.acService = new google.maps.places.AutocompleteService();
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
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
    var self = this;
    self.autocomplete.query = place.description;
    let place_id = place.place_id;
    var geocoder = new google.maps.Geocoder;
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
}
