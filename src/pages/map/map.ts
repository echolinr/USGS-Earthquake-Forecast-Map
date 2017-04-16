import { Component, OnInit, OnDestroy } from "@angular/core";
import { MapService } from "../../services/map.service";
import { GeocodingService } from "../../services/geocoding.service";
import { Subscription } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";
import { IMyDateRangeModel, IMyOptions, IMyDateRange } from 'mydaterangepicker';
import { SpatialForcastService } from "../../services/spatialforcast.service";

declare var google: any;

@Component({
  templateUrl: "./map.html",
  styleUrls: ['./map.scss']
})
export class MapPage implements OnInit, OnDestroy {
  private mapZoom: number = 10;
  private centerLat: number = 36.5;
  private centerLng: number = -122.45;
  private hasParams: boolean = false;

  private map: any;
  private forcastLayer: any;
  private pga: number = 0.8;
  private startDay: number = 0;
  private endDay: number = 14;
  private sliderValue: number = 1;
  private timerID: any[];

  private MMIData: any[];
  private ForecastTableData: any;
  private ForecastData: any[];
  private forcastTimeSlot: number[];
  private probMapData: any[];

  private autocompleteItems: any;
  private autocomplete: any;
  private subscription: Subscription;
  private acService: any;

  private geocoderService = new google.maps.Geocoder;

  private selectedRegion: string;
  private interaction: boolean = true;

  private myDateRangePickerOptions: IMyOptions = {
    clearBtnTxt: 'Clear',
    beginDateBtnTxt: 'Begin Date',
    endDateBtnTxt: 'End Date',
    acceptBtnTxt: 'OK',
    dateFormat: 'mmm dd (yyyy)',
    firstDayOfWeek: 'mo',
    sunHighlight: true,
    height: '34px',
    width: '260px',
    inline: false,
    selectionTxtFontSize: '14px',
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    disableUntil: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() - 1
    }

  };
  private selectedDateRangeNormal: IMyDateRange = {
    beginDate: { year: 2018, month: 10, day: 9 },
    endDate: { year: 2018, month: 10, day: 19 }
  };

  constructor(private mapService: MapService, private geocoder: GeocodingService,
    private activatedRoute: ActivatedRoute, private router: Router,
    private spatialForcastService: SpatialForcastService) {
    this.subscription = activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        if (queryParam['lat']) {
          this.centerLat = Number.parseFloat(queryParam['lat']);
          this.centerLng = Number.parseFloat(queryParam['lng']);
          this.mapZoom = Number.parseInt(queryParam['zoomLevel']);
          this.hasParams = true;
        }
      }
    );

    this.spatialForcastService.loadSpatialForecastData().subscribe(data => {
      if (data) {
        this.forcastTimeSlot = data.map(function (value) { return value.tend }).filter((value, index, self) => self.indexOf(value) === index);
        this.ForecastTableData = this.getForecastTable(data, this.startDay);
        //this.MMIData = this.getMMIStats(this.getDataByTime(this.endDay, data));
        this.ForecastData = data;
        this.timerID = new Array(this.forcastTimeSlot.length + 1);

        this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDay, this.endDay, this.pga);
      } else {
        console.log('No Data');
      }
    }, error => {
      console.log(error);
    });
  }

  ngOnInit() {
    this.loadAutoComplete();
    this.loadMap();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /* MAP */

  loadMap() {
    let self = this;

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

    this.mapService.map = this.map;

    let emptyMarkers: L.Layer[];
    let markersLayer = new L.LayerGroup(emptyMarkers);

    markersLayer.addTo(this.map);
    this.map.on("click", (e) => {
      if (!this.interaction) return;
      this.MMIData = this.getMMIStatsForLocation(this.ForecastData, e.latlng.lat, e.latlng.lng)
      this.reverseGeoCoding(e.latlng).then((result) => {
        markersLayer.clearLayers();
        markersLayer.addLayer(L.marker(e.latlng, { title: result }));
      })
        .catch((error) => {
          console.log(error);
        });
    });

    this.map.on('zoomend', () => {
      this.mapZoom = this.map.getZoom();
      this.centerLat = this.map.getCenter().lat;
      this.centerLng = this.map.getCenter().lng;

      this.router.navigate(['map'], { queryParams: { 'lat': this.centerLat, 'lng': this.centerLng, 'zoomLevel': this.mapZoom } });
      this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDay, this.endDay, this.pga);
    });

    this.map.on('moveend', () => {
      if ((this.centerLat !== this.map.getCenter().lat) ||
        (this.centerLng !== this.map.getCenter().lng) ||
        (this.mapZoom !== this.map.getZoom())) {
        this.mapZoom = this.map.getZoom();
        this.centerLat = this.map.getCenter().lat;
        this.centerLng = this.map.getCenter().lng;
        this.router.navigate(['map'], {
          queryParams: {
            'lat': this.centerLat,
            'lng': this.centerLng,
            'zoomLevel': this.mapZoom
          }
        });
      }
    });

    this.map.on('load', () => {
      this.mapZoom = this.map.getZoom();
      this.centerLat = this.map.getCenter().lat;
      this.centerLng = this.map.getCenter().lng;
      this.router.navigate(['map'], {
        queryParams: {
          'lat': this.centerLat,
          'lng': this.centerLng,
          'zoomLevel': this.mapZoom
        }
      });
    });
  }

  moveMap(place: any) {
    let self = this;
    self.autocomplete.query = place.description;
    let place_id = place.place_id;
    let geocoder = new google.maps.Geocoder;
    geocoder.geocode({ 'placeId': place_id }, function (results, status) {
      if (status === 'OK') {
        if (results[0]) {
          let location = results[0].geometry.location;
          let latlng = L.latLng(location.lat(), location.lng());
          self.map.setView(latlng, self.mapZoom, { animation: true });
        } else {
          console.log(status);
        }
      } else {
        console.log(status);
      }
    });
  }

  mapPanToCurrent() {
    this.geocoder.getCurrentLocation()
      .subscribe(
      location => this.map.panTo([location.latitude, location.longitude]),
      err => console.error(err)
      );
  }

  reverseGeoCoding(latlng: L.LatLngExpression): Promise<string> {
    let self = this;
    return new Promise<string>((resolve, reject) => {

      this.geocoderService.geocode({ 'location': latlng }, function (results, status) {
        if (status === 'OK') {
          if (results[1]) {
            self.selectedRegion = results[1].address_components.find(function (value) { return value.types.indexOf("sublocality") != -1 || value.types.indexOf("locality") != -1 }).long_name + ', '
              + results[1].address_components.find(function (value) { return value.types.indexOf("administrative_area_level_1") != -1 }).long_name || "Unknown Region";

            self.autocomplete.query = self.selectedRegion;
            resolve(self.selectedRegion);
          } else {
            self.selectedRegion = "Unknown Region";
            self.autocomplete.query = "Unknown Region";
            resolve('Unknown Region');
          }
        } else {
          self.selectedRegion = "Unknown Region";
          self.autocomplete.query = "Unknown Region";
          resolve('Unknown Region');
        }
      });
    });
  }

  /* Probabilities and Data Analysis */

  updateForcastProbMap(lat: number, lng: number, zoom: number, start: number, end: number, pga: number) {

    this.probMapData = this.getProbabilityDataForPGA(start, end, pga, this.getDataByTime(end, this.ForecastData));

    if (this.probMapData) {
      if (this.forcastLayer) {
        this.forcastLayer.setLatLngs(this.probMapData).addTo(this.map);
        this.forcastLayer.setOptions({ radius: 2 * this.mapZoom });
      } else {
        this.forcastLayer = L.heatLayer(this.probMapData, { radius: 2 * this.mapZoom, maxZoom: this.map.getZoom() }).addTo(this.map);
      }
    } else {
      console.log('probMapData not ready');
    }
  }

  groupProbabilitiesForPGA(array, groupFunction) {
    let groups = {};
    array.forEach(function (item) {
      let group = JSON.stringify(groupFunction(item));
      groups[group] = groups[group] || [];
      groups[group].push(item);
    });

    return Object.keys(groups).map(function (group) {
      return [groups[group][0].latitude, groups[group][0].longitude, 1.0 - groups[group].reduce(function (previous, current) {
        if (typeof previous === 'object') return (1.0 - previous.pga);
        return previous * (1.0 - current.pga);
      })];
    })
  }


  getProbabilityDataForPGA(start: number, end: number, pga: number, data: any[]): any[] {
    return this.groupProbabilitiesForPGA(data.map(function (value) {
      return {
        latitude: value.latitude, longitude: value.longitude, pga: 1.0 - Object.keys(value.p_PGA).filter(function (filter) {
          return parseFloat(filter) >= pga
        }).map(function (pga) {
          return parseFloat(value.p_PGA[pga]);
        }).reduce(function (previous, current, index) {
          if (index == 1) return (1.0 - previous);
          return previous * (1.0 - current);
        })
      }
    }), function (item) {
      return [item.latitude, item.longitude]
    });
  }

  /* RJ and Histogram */

  getDataByTime(days: Number, data: any[]): any[] {
    return data.filter(function (row) { return row.tend <= days });
  }

  getMMIStatsForLocation(data: any[], lat: number, lng: number): any[] {
    let MMIStats = [];
    let scale = 0.05;

    let lat_low = Math.floor(lat/scale)*scale;
    let lat_high = Math.ceil(lat/scale)*scale;
    let lng_low = Math.floor(lng/scale)*scale;
    let lng_high = Math.ceil(lng/scale)*scale;

    let filteredData = data.filter(function(value){
      return (value.latitude >= lat_low && value.latitude <= lat_high) && (value.longitude >= lng_low && value.longitude <= lng_high);
    });

    if (filteredData.length == 1) {
      Object.keys(filteredData[0].p_MMI).map(function (value) {
        MMIStats.push({ "label": value, "value": filteredData[0].p_MMI[value] });
      });
      return MMIStats;
    } else if (filteredData.length > 1) {
      Object.keys(filteredData[0].p_MMI).map(function (value) {
        let P = filteredData.reduce(function (previous, current) {
          if (typeof previous === 'object') return (1 - previous.p_MMI[value]);
          return previous * (1 - current.p_MMI[value]);
        });
        MMIStats.push({ "label": value, "value": (1 - P) });
      });
    }

    return MMIStats;
  }

  getForecastTable(data: any[], day: number): any {
    let m = [5, 6, 7, 8];

    data = data.filter(function (row) { return row.tstart >= day });
    let events = data.map(function (item) { return [item.tstart, item.tend].concat(m.map(function (magnitude) { return Math.pow(10, item.a - item.b * magnitude); })); });

    let week = events.filter(function (row) { return row[1] <= (day + 7) }).reduce(function (previous, current) {
      if (!Array.isArray(previous)) {
        return current;
      }
      return previous.map(function (value, index) { return value + current[index]; });
    });
    week = week.slice(2);

    let month = events.filter(function (row) { return row[1] <= (day + 30) }).reduce(function (previous, current) {
      if (!Array.isArray(previous)) {
        return current;
      }
      return previous.map(function (value, index) { return value + current[index]; });
    });
    month = month.slice(2);

    let year = events.filter(function (row) { return row[1] <= (day + 360) }).reduce(function (previous, current) {
      if (!Array.isArray(previous)) {
        return current;
      }
      return previous.map(function (value, index) { return value + current[index]; });
    });
    year = year.slice(2);

    return { 'week': week, 'month': month, 'year': year };
  }


  /* AUTOCOMPLETE */


  loadAutoComplete() {
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

  /* EVENTS  */

  incPGA() {
    if (this.pga > 0.1 && this.pga < 1.5) {
      this.pga += 0.1;
    }
    this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDay, this.endDay, this.pga);
  }
  decPGA() {
    if (this.pga > 0.1 && this.pga <= 1.5) {
      this.pga -= 0.1;
    }
    this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDay, this.endDay, this.pga);
  }

  disableMapInteraction() {
    this.interaction = false;
    this.map.dragging.disable();
    this.map.doubleClickZoom.disable();
    if (this.map.tap) this.map.tap.disable();
  }

  disableClick() {
    let self = this;
    this.interaction = false;
    setTimeout(function () { self.interaction = true }, 500);
  }

  enableMapInteraction() {
    this.interaction = true;
    this.map.dragging.enable();
    this.map.doubleClickZoom.enable();
    if (this.map.tap) this.map.tap.enable();
  }

  getDaysDiff(begin, end) {
    let beginDateStamp = begin.getTime();
    let endDateStamp = end.getTime();

    return (endDateStamp - beginDateStamp) / 1000 / 60 / 60 / 24 | 0;
  }

  onDateRangeChanged(event: IMyDateRangeModel) {
    if ((event.beginEpoc < event.endEpoc) && (event.endEpoc !== 0) && (event.beginEpoc != 0)) {

      this.startDay = this.getDaysDiff(new Date(), event.beginJsDate);
      this.endDay = this.getDaysDiff(event.beginJsDate, event.endJsDate) + this.startDay;

      if (this.startDay === this.endDay) {
        this.startDay--;
      }
    }
  }

  onUpdateForcast() {
    this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDay, this.endDay, this.pga);
  }

  sliderUpdateForcast(lat: number, lng: number, zoom: number, start: number, end: number, pga: number) {
    this.sliderValue = this.forcastTimeSlot.indexOf(end) + 1;
    this.updateForcastProbMap(lat, lng, zoom, start, end, pga);
  }

  resetSliderValue() {
    this.sliderValue = 1;
    this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDay, this.endDay, this.pga);
  }

  onSliderChanged(event: any) {
    this.sliderValue = event.value;
    this.sliderUpdateForcast(this.centerLat, this.centerLng, this.mapZoom, this.startDay, this.forcastTimeSlot[this.sliderValue - 1], this.pga);
  }

  forcastPlay() {
    let id: any;

    for (let i = this.sliderValue - 1; i < this.forcastTimeSlot.length; i++) {
      id = setTimeout((p) => { this.sliderUpdateForcast(p.a, p.b, p.c, p.d, p.e, p.f) }, i * 1000,
        { a: this.centerLat, b: this.centerLng, c: this.mapZoom, d: this.startDay, e: this.forcastTimeSlot[i], f: this.pga });
      this.timerID[i] = id;
    }

    id = setTimeout((p) => { this.resetSliderValue() }, (this.forcastTimeSlot.length + 1) * 1000);
    this.timerID[this.forcastTimeSlot.length] = id;
  }

  pauseForcastPlay() {
    let i: number;
    let id: any;

    for (let i = this.sliderValue; i < this.forcastTimeSlot.length; i++) {
      id = this.timerID[i];
      clearTimeout(id);
    }
  }

  stopForcastPlay() {
    let i: number;
    let id: any;

    for (let i = this.sliderValue; i < (this.forcastTimeSlot.length + 1); i++) {
      id = this.timerID[i];
      clearTimeout(id);
    }
    this.resetSliderValue();
  }

  rewindForcastPlay() {
    if (this.sliderValue > 1) {
      this.sliderValue = this.sliderValue - 1;
      this.sliderUpdateForcast(this.centerLat, this.centerLng, this.mapZoom, this.startDay, this.forcastTimeSlot[this.sliderValue - 1], this.pga);
    }
  }
  forwardForcastPlay() {
    if (this.sliderValue < 12) {
      this.sliderValue = this.sliderValue + 1;
      this.sliderUpdateForcast(this.centerLat, this.centerLng, this.mapZoom, this.startDay, this.forcastTimeSlot[this.sliderValue - 1], this.pga);
    }
  }
}
