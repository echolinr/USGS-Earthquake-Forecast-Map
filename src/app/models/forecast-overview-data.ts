export class ForecastOverviewData {
    ID: string;
    info: string;
    from: Date;
    to: Date;
    updated: Date;
    intensity: number;
    type: string; // marker, circle, polygon TODO: Convert into ENUM
    latitude?: number;
    longitude?: number;
    radius?: number;
    points?: L.LatLng[];
}