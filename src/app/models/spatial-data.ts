import {MMIData} from "./mmi-data";
import {ForecastRow} from "./forecast-row";

export class SpatialData {
    loc: number[];
    latitude: number;
    longitude: number;
    tstart: Date;
    tend: Date;
    p_MMI: MMIData;
    p_PGA: any;
    Ranges: ForecastRow[];
    ForecastID: string;
}