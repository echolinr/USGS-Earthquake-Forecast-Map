declare namespace L {
    namespace vectorGrid {
        export function slicer(data: any, options?: any): any;
    }
    export function heatLayer(data:any, options?:any): any;
    
    class webGLHeatmap {
        constructor(options?:any);

        setData(data: any[]);
    }
}