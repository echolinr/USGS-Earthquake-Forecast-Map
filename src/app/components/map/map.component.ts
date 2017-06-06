import { Component, OnInit, OnDestroy, ViewChild, Renderer } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { Subscription } from "rxjs";

import { MdButtonToggleGroup } from "@angular/material"
import { IMyDateRangeModel, IMyOptions, IMyDateRange, IMyDate } from 'mydaterangepicker';

import { GeocodingService } from "app/services/geocoding.service";
import { MapService } from "app/services/map.service";
import { SpatialForecastService } from "app/services/spatial-forecast.service";

import { SpatialData } from 'app/models/spatial-data';
import { ForecastRow } from 'app/models/forecast-row';
import { ForecastOverviewData } from 'app/models/forecast-overview-data';
import { Place } from 'app/models/place';

declare var google: any;
declare var Smooth: any;

@Component({
  templateUrl: "./map.component.html",
  styleUrls: ['./map.component.scss']
})

export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('group')
  private group: MdButtonToggleGroup;
  @ViewChild('groupPlaces')
  private groupPlaces: MdButtonToggleGroup;
  private mapIsBlur: boolean = false;
  private loadFile: boolean = false;
  private loading: boolean = false;

  private mapZoom: number = 5;
  private centerLat: number = 38.06;
  private centerLng: number = -103.71;
  private hasParams: boolean = false;

  private map: any;
  private forecastLayer: any;
  private markersLayer: any;
  private pga: number = 0.8;

  private startDate: Date;
  private endDate: Date;
  private forecastStartDate: Date;
  private forecastEndDate: Date;
  private sliderDate: Date;

  private sliderValue: number = 7;
  private sliderMin: number;
  private sliderMax: number;
  private timerID: any[];
  private playingForcast: boolean = false;
  private accessibleOn = false;

  private selectedRegion: string;
  private activeLocation: Place;
  private savePlaceDisabled: boolean = true;
  private savedPlaces: Place[] = [];

  private MMIData: any[];
  private PGAData: any[];
  private PGARange: any[];
  private ForecastTableData: any;

  private ForecastData: SpatialData[];
  private AvailableForecastData: ForecastOverviewData[];
  private forcastTimeSlot: Date[];
  private probMapData: any[];

  private autocompleteItems: any;
  private autocomplete: any;
  private subscription: Subscription;
  private mapSubscription: Subscription;
  private acService: any;
  private geocoderService = new google.maps.Geocoder;
  private USFaultLayer: L.TileLayer;

  private interaction: boolean = true;
  private pPGA_max: number;
  private pPGA_min: number;

  private myDateRangePickerOptions: IMyOptions;
  private mySelDateRange: IMyDateRange;

  private selectedModel: string = 'PGA';

  constructor(private mapService: MapService, private geocoder: GeocodingService,
    private activatedRoute: ActivatedRoute, private router: Router, private renderer: Renderer,
    private spatialForcastService: SpatialForecastService) {
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
  }

  ngOnInit() {
    this.loadAutoComplete();
    this.loadMap();
    this.loadAvailableForecasts();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadAvailableForecasts() {
    let self = this;
    if (this.forecastLayer) this.map.removeLayer(this.forecastLayer);
    if (this.markersLayer) this.map.removeLayer(this.markersLayer);
    
    self.group.value = 'map';
    delete this.forecastLayer;
    delete this.markersLayer;
    delete this.ForecastData;

    this.map.off('click');
    this.map.off('load');
    this.map.off('moveend');
    this.map.off('zoomend');

    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    if (this.map.tap) this.map.tap.disable();

    this.map.options.maxZoom = 5;
    this.map.setView(L.latLng(38.06, -103.71), 5, { animation: true });

    this.loading = true;
    this.mapSubscription = this.spatialForcastService.loadAvailableForecastsData().subscribe(data => {
      if (data) {
        this.AvailableForecastData = data;
        let emptyMarkers: L.Layer[];
        let markersLayer = new L.LayerGroup(emptyMarkers);
        markersLayer.addTo(self.map);

        let clickFunction = function (ID: string): void {
          markersLayer.clearLayers();
          self.loadForecastData(ID);
        }

        let datePipe = new DatePipe('en-US');
        this.AvailableForecastData.forEach(function (value, index) {
          let popUpContent = `
            <h3>Available Forecast</h3>
            ${value.info}
            <table>
              <tr><th>From</th><td>${datePipe.transform(value.from, 'short')}</td></tr>
              <tr><th>To</th><td>${datePipe.transform(value.to, 'short')}</td></tr>
              <tr><th>Updated</th><td>${datePipe.transform(value.updated, 'short')}</td></tr>
            </table>          
          `
          if (value.type == "marker") {
            markersLayer.addLayer(L.marker(L.latLng(value.latitude, value.longitude)).on('click', function (e) { clickFunction(value.ID) }).bindPopup(popUpContent).on('mouseover', function (e) { this.openPopup(); }).on('mouseout', function (e) { this.closePopup(); }));
          } else if (value.type == "circle") {
            markersLayer.addLayer(L.circle(L.latLng(value.latitude, value.longitude), value.radius, { color: "red", fillColor: "#F03", fillOpacity: 0.7 }).on('click', function (e) { clickFunction(value.ID) }).bindPopup(popUpContent).on('mouseover', function (e) { this.openPopup(); }).on('mouseout', function (e) { this.closePopup(); }));
          } else if (value.type == "polygon") {
            markersLayer.addLayer(L.polygon(value.points, { color: "red", fillColor: "#F03", fillOpacity: 0.7 }).on('click', function (e) { clickFunction(value.ID) }).bindPopup(popUpContent).on('mouseover', function (e) { this.openPopup(); }).on('mouseout', function (e) { this.closePopup(); }));
          }
        });
        this.loading = false;
      } else {
        console.log('No Data');
      }
      this.loading = false;
    }, error => {
      console.log(error);
      this.loading = false;
    });
  }

  loadForecastData(ID: string) {
    this.loading = true;
    this.mapSubscription = this.spatialForcastService.loadSpatialForecastData(ID).subscribe(data => {
      if (data) {
        this.ForecastData = data;
        this.forcastTimeSlot = this.ForecastData.map(item => item.tend).filter((value, index, self) => self.indexOf(value) === index);

        this.map.dragging.enable();
        this.map.touchZoom.enable();
        this.map.scrollWheelZoom.enable();
        this.map.boxZoom.enable();
        this.map.keyboard.enable();
        if (this.map.tap) this.map.tap.enable();

        if (this.ForecastData.length > 0) {

          let centerLat = this.ForecastData.map(item => item.latitude).reduce((previous, current) => previous + current) / this.ForecastData.length;
          let centerLng = this.ForecastData.map(item => item.longitude).reduce((previous, current) => previous + current) / this.ForecastData.length;

          this.map.options.maxZoom = 10;
          this.map.setView(L.latLng(centerLat, centerLng), 6, { animation: true });
          this.updateMapForForecast();

          this.timerID = new Array(this.forcastTimeSlot.length + 1);
          this.startDate = new Date(this.ForecastData[0].tstart);
          this.endDate = new Date(this.forcastTimeSlot[this.forcastTimeSlot.length - 1]);
          this.forecastStartDate = this.startDate;
          this.forecastEndDate = this.endDate;
          this.sliderDate = this.endDate;
          let pgaList = Object.keys(this.ForecastData[0].p_PGA);
          this.pPGA_max = Math.max.apply(Math, pgaList);
          this.pPGA_min = Math.min.apply(Math, pgaList);
          this.ForecastTableData = this.getForecastTable(this.ForecastData, this.startDate);

          this.myDateRangePickerOptions = {
            selectBeginDateTxt: 'Begin Date',
            selectEndDateTxt: 'End Date',
            dateFormat: 'mmm dd (yyyy)',
            firstDayOfWeek: 'mo',
            sunHighlight: true,
            height: '34px',
            width: '260px',
            inline: false,
            selectionTxtFontSize: '14px',
            alignSelectorRight: false,
            indicateInvalidDateRange: true,
            disableUntil: { year: this.startDate.getFullYear(), month: this.startDate.getMonth() + 1, day: this.startDate.getDate() - 1 },
            disableSince: { year: this.endDate.getFullYear(), month: this.endDate.getMonth() + 1, day: this.endDate.getDate() + 1 },
          };
          this.mySelDateRange = {
            beginDate: { year: this.startDate.getFullYear(), month: this.startDate.getMonth() + 1, day: this.startDate.getDate() },
            endDate: { year: this.endDate.getFullYear(), month: this.endDate.getMonth() + 1, day: this.endDate.getDate() }
          };

          this.sliderMin = this.getForcastSlot(this.startDate);
          this.sliderMax = this.getForcastSlot(this.endDate);
          this.sliderValue = this.sliderMax;
        }

        this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDate, this.endDate, this.pga);

        this.loading = false;
      } else {
        console.log('No Data');
        this.loading = false;
      }
    }, error => {
      console.log(error);
      this.loading = false;
    });

  }

  /* MAP */

  loadMap() {
    let self = this;

    this.map = L.map("map", {
      zoomControl: false,
      center: L.latLng(this.centerLat, this.centerLng),
      zoom: this.mapZoom,
      minZoom: 4,
      maxZoom: 4,
      layers: [this.mapService.baseMaps.CartoDB]
    });

    L.control.zoom({ position: "topright" }).addTo(this.map);
    L.control.scale().addTo(this.map);

    this.mapService.map = this.map;
  }

  updateMapForForecast() {
    let self = this;

    let emptyMarkers: L.Layer[];
    self.markersLayer = new L.LayerGroup(emptyMarkers);

    self.markersLayer.addTo(self.map);
    self.map.on("click", (e) => {
      if (!self.interaction) return;
      self.MMIData = self.getMMIStatsForLocation(this.getDataByTime(self.startDate, self.endDate, self.ForecastData), e.latlng.lat, e.latlng.lng).sort(function (a, b) {
        if (self.parseStrToMmiNum(a.label) < self.parseStrToMmiNum(b.label)) return -1;
        if (self.parseStrToMmiNum(a.label) > self.parseStrToMmiNum(b.label)) return 1;
        return 0;
      });
      self.PGAData = self.getPGAStatsForLocation(this.getDataByTime(self.startDate, self.endDate, self.ForecastData), e.latlng.lat, e.latlng.lng).sort(function (a, b) {
        if (parseFloat(a.label) < parseFloat(b.label)) return -1;
        if (parseFloat(a.label) > parseFloat(b.label)) return 1;
        return 0;
      });

      let clickFunction = function (): void {
        self.group.value = 'reports'
      }

      self.PGARange = self.PGAData.map((element) => element.label).sort();
      self.reverseGeoCoding(e.latlng).then((result) => {
        self.markersLayer.clearLayers();
        self.markersLayer.addLayer(L.marker(e.latlng, { title: result }).on('click', clickFunction).on('dbclick', new clickFunction));
        self.savePlaceDisabled = false;
      })
        .catch((error) => {
          console.log(error);
        });
    });

    self.map.on('zoomend', () => {
      self.mapZoom = self.map.getZoom();
      self.centerLat = self.map.getCenter().lat;
      self.centerLng = self.map.getCenter().lng;

      self.router.navigate(['/'], { queryParams: { 'lat': this.centerLat, 'lng': self.centerLng, 'zoomLevel': self.mapZoom } });
      self.updateForcastProbMap(self.centerLat, self.centerLng, self.mapZoom, self.startDate, self.endDate, self.pga);
    });

    self.map.on('moveend', () => {
      if ((self.centerLat !== self.map.getCenter().lat) ||
        (self.centerLng !== self.map.getCenter().lng) ||
        (self.mapZoom !== self.map.getZoom())) {
        self.mapZoom = self.map.getZoom();
        self.centerLat = self.map.getCenter().lat;
        self.centerLng = self.map.getCenter().lng;
        self.router.navigate(['/'], {
          queryParams: {
            'lat': self.centerLat,
            'lng': self.centerLng,
            'zoomLevel': self.mapZoom
          }
        });
      }
    });

    self.map.on('load', () => {
      self.mapZoom = self.map.getZoom();
      self.centerLat = self.map.getCenter().lat;
      self.centerLng = self.map.getCenter().lng;
      self.router.navigate(['/'], {
        queryParams: {
          'lat': self.centerLat,
          'lng': self.centerLng,
          'zoomLevel': self.mapZoom
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

  reverseGeoCoding(latlng: L.LatLng): Promise<string> {
    let self = this;
    return new Promise<string>((resolve, reject) => {

      this.geocoderService.geocode({ 'location': latlng }, function (results, status) {
        if (status === 'OK') {
          if (results[1]) {
            try {
              self.selectedRegion = results[1].address_components.find(function (value) { return value.types.indexOf("sublocality") != -1 || value.types.indexOf("locality") != -1 }).long_name || "Unknown Region";
              self.selectedRegion += ', '
              self.selectedRegion += results[1].address_components.find(function (value) { return value.types.indexOf("administrative_area_level_1") != -1 }).long_name || "Unknown Region";

              self.autocomplete.query = self.selectedRegion;
              self.activeLocation = { name: self.selectedRegion, lat: latlng.lat, lng: latlng.lng }
              self.selectedRegion += " (" + latlng.lat.toFixed(4) + ", " + latlng.lng.toFixed(4) + ")";
              resolve(self.selectedRegion);
            }
            catch (e){
              self.selectedRegion = "Unknown Region";
              self.selectedRegion += " (" + latlng.lat.toFixed(4) + ", " + latlng.lng.toFixed(4) + ")";
              self.autocomplete.query = "Unknown Region";
              resolve('Unknown Region');
            }
          } else {
            self.selectedRegion = "Unknown Region";
            self.selectedRegion += " (" + latlng.lat.toFixed(4) + ", " + latlng.lng.toFixed(4) + ")";
            self.autocomplete.query = "Unknown Region";
            resolve('Unknown Region');
          }
        } else {
          self.selectedRegion = "Unknown Region";
          self.selectedRegion += " (" + latlng.lat.toFixed(4) + ", " + latlng.lng.toFixed(4) + ")";
          self.autocomplete.query = "Unknown Region";
          resolve('Unknown Region');
        }
      });
    });
  }

  /* Probabilities and Data Analysis */

  private getForcastSlot(day: Date): number {

    if (this.forcastTimeSlot.length > 0) {
      for (let i = 0; i < this.forcastTimeSlot.length; i++) {
        if (day.getTime() <= new Date(this.forcastTimeSlot[i]).getTime()) {
          return i;
        }
      }
    }
    return this.forcastTimeSlot.length - 1;
  }

  updateForcastProbMap(lat: number, lng: number, zoom: number, start: Date, end: Date, pga: number) {
    if (!this.ForecastData) return;
    let radiusFactor = 2;
    this.probMapData = this.getProbabilityDataForPGA(pga, this.getDataByTime(start, end, this.ForecastData));
    //this.probMapData = this.resampleMapData(this.probMapData);
    if (this.probMapData) {
      if (this.forecastLayer) {
        this.forecastLayer.setLatLngs(this.probMapData).addTo(this.map);
        if (this.accessibleOn) {
          this.forecastLayer.setOptions({ radius: radiusFactor * this.mapZoom, maxZoom: this.map.getZoom(), gradient: { 0.1: '#d9d9d9', 0.3: '#bfbfbf', 0.4: '#999999', 0.6: '#808080', 1.0: '#4d4d4d' } });
        } else {
          this.forecastLayer.setOptions({ radius: radiusFactor * this.mapZoom, maxZoom: this.map.getZoom(), gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' } });
        }
      } else {
        if (this.accessibleOn) {
          this.forecastLayer = L.heatLayer(this.probMapData, { radius: radiusFactor * this.mapZoom, maxZoom: this.map.getZoom(), gradient: { 0.1: '#d9d9d9', 0.3: '#bfbfbf', 0.4: '#999999', 0.6: '#808080', 1.0: '#4d4d4d' } }).addTo(this.map);
        } else {
          this.forecastLayer = L.heatLayer(this.probMapData, { radius: radiusFactor * this.mapZoom, maxZoom: this.map.getZoom(), gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' } }).addTo(this.map);
        }
      }
    } else {
      console.log('probMapData not ready');
    }
  }

  resampleMapData(data: any[]) {
    let scale = 0.01;
    let minX = Math.floor(Math.min(...data.map(x => x[0])));
    let maxX = Math.ceil(Math.max(...data.map(x => x[0])));
    let minY = Math.floor(Math.min(...data.map(x => x[1])));
    let maxY = Math.ceil(Math.max(...data.map(x => x[1])));
    console.log(minX);
    console.log(minY);
    console.log(maxX);
    console.log(maxY);
  	/*let x = data.map(x => x[0]);
	  let y = data.map(x => x[1]);
    let t = data.map(x => x[2]);
    let fitModel = kriging.train(t, x, y, 'exponential', 0, 100);*/
    let smooth = Smooth(data, {
      method: Smooth.METHOD_LINEAR, 
      clip: Smooth.CLIP_PERIODIC, 
      cubicTension: Smooth.CUBIC_TENSION_CATMULL_ROM
    });

    let newData = [];

    for (let x = minX; x <= maxX; x = x + scale) {
      for (let y = minY; y <= maxY; y = y + scale) {
        //let z = kriging.predict(x, y, fitModel);
        newData.push([x,y,smooth(x,y)[2]]);
      }
    }

    return newData;

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

  parseStrToMmiNum(str: string): number {
    if (str === 'I') {
      return 0.1;
    }
    if (str === 'II') {
      return 0.2;
    }
    if (str === 'III') {
      return 0.3;
    }
    if (str === 'IV') {
      return 0.4;
    }
    if (str === 'V') {
      return 0.5;
    }
    if (str === 'VI') {
      return 0.6;
    }
    if (str === 'VII') {
      return 0.7;
    }
    if (str === 'VIII') {
      return 0.8;
    }
    if (str === 'IX') {
      return 0.9;
    }
    return 1.0;
  }
  parseNumToMmiStr(mmi: number): string {
    if (mmi === 0.1) {
      return 'I';
    }
    if (mmi === 0.2) {
      return 'II';
    }
    if (mmi === 0.3) {
      return 'III';
    }
    if (mmi === 0.4) {
      return 'IV';
    }
    if (mmi === 0.5) {
      return 'V';
    }
    if (mmi === 0.6) {
      return 'VI';
    }
    if (mmi === 0.7) {
      return 'VII';
    }
    if (mmi === 0.8) {
      return 'VIII';
    }
    if (mmi === 0.9) {
      return 'IX';
    }
    return 'X';
  }
  getProbabilityDataForPGA(pga: number, data: SpatialData[]): any[] {
    if (this.isModelSelected('PGA')) {
      return this.groupProbabilitiesForPGA(data.map(function (value) {
        return {
          latitude: value.latitude,
          longitude: value.longitude,
          pga: 1.0 - Object.keys(value.p_PGA).filter(function (filter) {
            return parseFloat(filter) >= pga;
          }).map(function (pga) {
            return (1.0 - parseFloat(value.p_PGA[pga]));
          }).reduce(function (previous, current, index) {
            if (index == 1) return previous;
            return previous * current;
          })
        }
      }), function (item) {
        return [item.latitude, item.longitude]
      });
    } else {
      let self = this;
      return this.groupProbabilitiesForPGA(data.map(function (value) {
        return {
          latitude: value.latitude,
          longitude: value.longitude,
          pga: 1.0 - Object.keys(value.p_MMI).filter(function (filter) {
            return self.parseStrToMmiNum(filter) >= pga;
          }).map(function (mmi) {
            return (1.0 - parseFloat(value.p_MMI[mmi]));
          }).reduce(function (previous, current, index) {
            if (index == 1) return previous;
            return previous * current;
          })
        }
      }), function (item) {
        return [item.latitude, item.longitude]
      });
    }
  }

  /* RJ and Histogram */

  getDataByTime(startDate: Date, endDate: Date, data: SpatialData[]): SpatialData[] {
    return data.filter(function (row) { return (new Date(row.tend).getTime() <= new Date(endDate).getTime()) && (new Date(row.tstart).getTime() >= new Date(startDate).getTime()) });
  }

  getMMIStatsForLocation(data: any[], lat: number, lng: number): any[] {
    let MMIStats = [];
    let scale = 0.05;

    let lat_low = Math.floor(lat / scale) * scale;
    let lat_high = Math.ceil(lat / scale) * scale;
    let lng_low = Math.floor(lng / scale) * scale;
    let lng_high = Math.ceil(lng / scale) * scale;

    let filteredData = data.filter(function (value) {
      return (value.latitude >= lat_low && value.latitude <= lat_high) && (value.longitude >= lng_low && value.longitude <= lng_high);
    });

    if (filteredData.length == 1) {
      Object.keys(filteredData[0].p_MMI).map(function (value) {
        MMIStats.push({ "label": value, "value": filteredData[0].p_MMI[value] });
      });
      return MMIStats;
    } else if (filteredData.length > 1) {
      Object.keys(filteredData[0].p_MMI).map(function (value) {
        let P = filteredData.reduce(function (previous, current, index) {
          if (typeof previous === 'object') return (1 - previous.p_MMI[value]);
          return previous * (1 - current.p_MMI[value]);
        });
        MMIStats.push({ "label": value, "value": (1 - P) });
      });
    }

    return MMIStats;
  }

  getPGAStatsForLocation(data: any[], lat: number, lng: number): any[] {
    let PGAStats = [];
    let scale = 0.05;

    let lat_low = Math.floor(lat / scale) * scale;
    let lat_high = Math.ceil(lat / scale) * scale;
    let lng_low = Math.floor(lng / scale) * scale;
    let lng_high = Math.ceil(lng / scale) * scale;

    let filteredData = data.filter(function (value) {
      return (value.latitude >= lat_low && value.latitude <= lat_high) && (value.longitude >= lng_low && value.longitude <= lng_high);
    });

    if (filteredData.length == 1) {
      Object.keys(filteredData[0].p_PGA).map(function (value) {
        PGAStats.push({ "label": value, "value": filteredData[0].p_PGA[value] });
      });
      return PGAStats;
    } else if (filteredData.length > 1) {
      Object.keys(filteredData[0].p_PGA).map(function (value) {
        let P = filteredData.reduce(function (previous, current) {
          if (typeof previous === 'object') return (1 - previous.p_PGA[value]);
          return previous * (1 - current.p_PGA[value]);
        });
        PGAStats.push({ "label": value, "value": (1 - P) });
      });
    }

    return PGAStats;
  }

  getForecastTable(data: SpatialData[], day: Date): any {

    let magnitudes = data[0].Ranges.map((item) => item.minMag);
    data = data.filter(function (row) { return new Date(row.tstart) >= day });
    let events = data.map(function (item) { return { tend: item.tend, ranges: item.Ranges } });

    let week = events.filter(function (row) { return new Date(row.tend) <= (new Date(new Date(day).getTime() + 7 * 24 * 60 * 60 * 1000)) }).map((item) => item.ranges).reduce(function (previous, current) {
      if (!Array.isArray(previous)) {
        return current;
      }
      return previous.map(function (value, index) {
        return {
          minMag: magnitudes[index],
          rate: value.rate + current[index].rate,
          lowerBound: value.lowerBound + current[index].lowerBound,
          upperBound: value.upperBound + current[index].upperBound,
          probability: value.probability + current[index].probability
        } as ForecastRow
      });

    });

    let month = events.filter(function (row) { return new Date(row.tend) <= (new Date(new Date(day).getTime() + 30 * 24 * 60 * 60 * 1000)) }).map((item) => item.ranges).reduce(function (previous, current) {
      if (!Array.isArray(previous)) {
        return current;
      }
      return previous.map(function (value, index) {
        return {
          minMag: magnitudes[index],
          rate: value.rate + current[index].rate,
          lowerBound: value.lowerBound + current[index].lowerBound,
          upperBound: value.upperBound + current[index].upperBound,
          probability: value.probability + current[index].probability
        } as ForecastRow
      });

    });

    let year = events.filter(function (row) { return new Date(row.tend) <= (new Date(new Date(day).getTime() + 360 * 24 * 60 * 60 * 1000)) }).map((item) => item.ranges).reduce(function (previous, current) {
      if (!Array.isArray(previous)) {
        return current;
      }
      return previous.map(function (value, index) {
        return {
          minMag: magnitudes[index],
          rate: value.rate + current[index].rate,
          lowerBound: value.lowerBound + current[index].lowerBound,
          upperBound: value.upperBound + current[index].upperBound,
          probability: value.probability + current[index].probability
        } as ForecastRow
      });

    });
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
    let a = Math.trunc(this.pga * 10 + 0.5);
    let top = 10;
    if (this.isModelSelected('PGA')) {
      top = Math.trunc(this.pPGA_max * 10 + 0.5);
    }
    if (a < top) {
      a++;
      this.pga = a / 10;
    }
    this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDate, this.endDate, this.pga);
  }

  decPGA() {
    let a = Math.trunc(this.pga * 10 + 0.5);
    let bottom = 1;

    if (this.isModelSelected('PGA')) {
      bottom = Math.trunc(this.pPGA_min * 10 + 0.5);
    }

    if (a > bottom) {
      a--;
      this.pga = a / 10;
    }
    this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDate, this.endDate, this.pga);
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
    //this.map.doubleClickZoom.enable();
    if (this.map.tap) this.map.tap.enable();
  }


  onDateRangeChanged(event: IMyDateRangeModel) {
    if ((event.beginEpoc <= event.endEpoc) && (event.endEpoc !== 0) && (event.beginEpoc != 0)) {

      this.startDate = event.beginJsDate;
      this.endDate = event.endJsDate;
    }
  }

  onUpdateForcast() {
    this.sliderMin = this.getForcastSlot(this.startDate);// + 1;
    this.sliderMax = this.getForcastSlot(this.endDate);// + 1;
    this.sliderValue = this.sliderMin + 1;
    this.startDate = this.startDate;
    this.sliderDate = this.startDate;
    this.ForecastTableData = this.getForecastTable(this.ForecastData, this.startDate);
    this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.forcastTimeSlot[this.sliderMin], this.forcastTimeSlot[this.sliderMax], this.pga);
  }

  sliderUpdateForcast(lat: number, lng: number, zoom: number, start: Date, end: Date, pga: number) {
    this.sliderValue = this.forcastTimeSlot.indexOf(end) + 1;
    this.sliderDate = this.forcastTimeSlot[this.sliderValue];
    this.updateForcastProbMap(lat, lng, zoom, start, end, pga);
  }

  resetSliderValue() {
    this.playingForcast = false;
    this.sliderValue = this.sliderMin + 1;
    this.sliderDate = this.forcastTimeSlot[this.sliderValue];
    this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDate, this.endDate, this.pga);
  }

  onSliderChanged(event: any) {
    this.sliderValue = event.value + 1;
    this.sliderDate = this.forcastTimeSlot[this.sliderValue - 1];
    this.sliderUpdateForcast(this.centerLat, this.centerLng, this.mapZoom, this.startDate, this.forcastTimeSlot[this.sliderValue - 1], this.pga);
  }

  toggleMapAccessible() {
    this.accessibleOn = !this.accessibleOn;
    if (this.accessibleOn) {
      this.forecastLayer.setOptions({ radius: 2 * this.mapZoom, maxZoom: this.map.getZoom(), gradient: { 0.1: '#d9d9d9', 0.3: '#bfbfbf', 0.4: '#999999', 0.6: '#808080', 1.0: '#4d4d4d' } });
    } else {
      this.forecastLayer.setOptions({ radius: 2 * this.mapZoom, maxZoom: this.map.getZoom(), gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' } });
    }
  }

  isPlayingForcast() {
    return this.playingForcast;
  }

  forcastPlay() {
    let id: any;

    this.playingForcast = true;
    if (this.sliderValue === this.sliderMax) {
      this.sliderValue = this.sliderMin;
    }
    for (let i = this.sliderValue; i <= this.sliderMax; i++) {
      id = setTimeout((p) => { this.sliderUpdateForcast(p.a, p.b, p.c, p.d, p.e, p.f) }, i * 1000,
        { a: this.centerLat, b: this.centerLng, c: this.mapZoom, d: this.startDate, e: this.forcastTimeSlot[i], f: this.pga });
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
    if (this.sliderValue > this.sliderMin) {
      this.sliderValue = this.sliderValue - 1;
      this.sliderUpdateForcast(this.centerLat, this.centerLng, this.mapZoom, this.startDate, this.forcastTimeSlot[this.sliderValue], this.pga);
    }
  }
  forwardForcastPlay() {
    if (this.sliderValue < this.sliderMax) {
      this.sliderValue = this.sliderValue + 1;
      this.sliderUpdateForcast(this.centerLat, this.centerLng, this.mapZoom, this.startDate, this.forcastTimeSlot[this.sliderValue], this.pga);
    }
  }
  setModelRadio(e: string): void {
    if (e !== this.selectedModel) {
      this.selectedModel = e;
      if (this.isModelSelected('MMI')) {
        this.pga = 0.8;
      } else {
        this.pga = this.pPGA_min + Math.trunc((this.pPGA_max - this.pPGA_min) * 5) / 10;
        this.pga = Math.trunc(this.pga * 10 + 0.5) / 10;
      }
      this.updateForcastProbMap(this.centerLat, this.centerLng, this.mapZoom, this.startDate, this.endDate, this.pga);
    }
  }

  isModelSelected(name: string): boolean {
    if (!this.selectedModel) {
      return false;
    }
    return (this.selectedModel === name);
  }

  saveLocation() {
    if (this.activeLocation) {
      if (this.activeLocation.name.indexOf("Unknown Region") === -1 && this.savedPlaces.indexOf(this.activeLocation) === -1) {
        this.savedPlaces.push(this.activeLocation);
      }
    }
  }

  dataDownloader() {
    let anchor = this.renderer.createElement(document.body, 'a');
    this.renderer.setElementStyle(anchor, 'visibility', 'hidden');
    this.renderer.setElementAttribute(anchor, 'href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.savedPlaces)));
    this.renderer.setElementAttribute(anchor, 'target', '_blank');
    this.renderer.setElementAttribute(anchor, 'download', "Forecastdata.json");

    setTimeout(() => {
      this.renderer.invokeElementMethod(anchor, 'click');
      this.renderer.invokeElementMethod(anchor, 'remove');
    }, 50);
  }

  fileUpload(event){
    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
        let file: File = fileList[0];
        let reader = new FileReader();
        this.loading = true;
        reader.onloadend = (e) => {
          this.savedPlaces = JSON.parse(reader.result);
          this.loadFile = false;
          this.loading = false;
        }
        reader.readAsText(file);
    }
  }

  toggleUSFault() {
    let self = this;

    if (self.USFaultLayer) {
      self.map.removeLayer(self.USFaultLayer);
      delete self.USFaultLayer;
    } else {
      self.USFaultLayer = L.tileLayer("https://earthquake.usgs.gov/basemap/tiles/faults/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">USGS</a>'
      }).addTo(self.map);
    }
  }

  createMarker(place: Place){
    let self = this;
    if (!self.interaction) return;

    self.MMIData = self.getMMIStatsForLocation(self.ForecastData, place.lat, place.lng).sort(function (a, b) {
      if (self.parseStrToMmiNum(a.label) < self.parseStrToMmiNum(b.label)) return -1;
      if (self.parseStrToMmiNum(a.label) > self.parseStrToMmiNum(b.label)) return 1;
      return 0;
    });
    self.PGAData = self.getPGAStatsForLocation(self.ForecastData, place.lat, place.lng).sort(function (a, b) {
      if (parseFloat(a.label) < parseFloat(b.label)) return -1;
      if (parseFloat(a.label) > parseFloat(b.label)) return 1;
      return 0;
    });
    self.PGARange = self.PGAData.map((element) => element.label).sort();

    self.savePlaceDisabled = false;
    self.selectedRegion = place.name;
    self.autocomplete.query = self.selectedRegion;
    self.activeLocation = place;
    self.selectedRegion += " (" + place.lat.toFixed(4) + ", " + place.lng.toFixed(4) + ")";

    self.markersLayer.clearLayers();
    let clickFunction = function (): void {
      self.group.value = 'reports';
    }
    self.markersLayer.addLayer(L.marker(L.latLng(place.lat, place.lng), { title: place.name }).on('click', clickFunction).on('dbclick', new clickFunction));
    this.hidePlacesList();
  }

  hidePlacesList() {
    this.groupPlaces.value = "";
    this.groupPlaces._buttonToggles.first.checked = false;
    this.mapIsBlur = false;
  }
}
