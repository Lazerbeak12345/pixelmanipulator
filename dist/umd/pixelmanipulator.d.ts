interface xycoord {
    x: number;
    y: number;
}
declare type hitbox = xycoord[];
interface rel {
    x: number;
    y: number;
    mooreNearbyCounter: mooreNearbyCounter;
    wolframNearbyCounter: wolframNearbyCounter;
}
interface ElementData {
    [index: string]: string | number[] | boolean | hitbox | ((rel: rel) => void) | number | undefined;
    name: string;
    color: number[];
    pattern?: string;
    loop?: boolean;
    hitbox: hitbox;
    liveCell?: (rel: rel) => void;
    deadCell?: (rel: rel) => void;
    number: number;
}
interface ElementDataUnknown {
    [index: string]: string | number[] | boolean | hitbox | ((rel: rel) => void) | number | undefined;
    name?: string;
    color?: number[];
    pattern?: string;
    loop?: boolean;
    hitbox?: hitbox;
    liveCell?: (rel: rel) => void;
    deadCell?: (rel: rel) => void;
    number?: number;
}
interface ElementDataUnknownNameMandatory {
    name: string;
    color?: number[];
    pattern?: string;
    loop?: boolean;
    hitbox?: hitbox;
    liveCell?: (rel: rel) => void;
    deadCell?: (rel: rel) => void;
    number?: number;
}
declare type whatIs = (x: number, y: number, loop: boolean) => string;
interface canvasSizes {
    canvasW?: number;
    canvasH?: number;
    zoomW?: number;
    zoomH?: number;
}
declare type getPixelId = (x: number, y: number, loop?: boolean) => number;
declare type getPixel = (x: number, y: number, loop: boolean) => number[];
declare type confirmElm = (x: number, y: number, name: string | number | number[], loop?: boolean) => boolean;
declare type mooreNearbyCounter = (x: number, y: number, name: string | number | number[], loop?: boolean) => number;
declare type wolframNearbyCounter = (x: number, y: number, name: string | number | number[], binDex: string | number, loop?: boolean) => boolean;
export declare class PixelManipulator {
    loopint: number;
    zoomX: number;
    zoomY: number;
    _width: number;
    _height: number;
    row: number;
    elementTypeMap: {
        [index: string]: ElementData;
    };
    elementNumList: string[];
    nameAliases: {
        [index: string]: string;
    };
    mode: string;
    zoomScaleFactor: number;
    zoomctxStrokeStyle: string;
    defaultId: number;
    onIterate: () => void;
    onAfterIterate: () => void;
    neighborhoods: {
        wolfram: (radius?: number | undefined, yval?: number | undefined, include_self?: boolean | undefined) => {
            x: number;
            y: number;
        }[];
        moore: (radius?: number | undefined, include_self?: boolean | undefined) => {
            x: number;
            y: number;
        }[];
        vonNeumann: (radius?: number | undefined, include_self?: boolean | undefined) => {
            x: number;
            y: number;
        }[];
        euclidean: (radius?: number | undefined, include_self?: boolean | undefined) => {
            x: number;
            y: number;
        }[];
    };
    onElementModified: (id: number) => void;
    get_width(): number;
    _canvas: undefined | HTMLCanvasElement;
    set_width(value: number): void;
    get_height(): number;
    set_height(value: number): void;
    randomlyFill(value: string | number | number[], pr?: number): void;
    addMultipleElements(map: {
        [index: string]: ElementDataUnknown;
    }): void;
    addElement(data: ElementDataUnknownNameMandatory): void;
    modifyElement(id: number, data: ElementDataUnknown): void;
    aliasElements(oldData: ElementDataUnknownNameMandatory, newData: ElementDataUnknownNameMandatory): void;
    getElementByName(name: string): ElementData;
    __WhatIs(getPixelId: getPixelId): whatIs;
    play(canvasSizes?: canvasSizes): void;
    reset(canvasSizes?: canvasSizes): void;
    pause(): void;
    zoom(e?: {
        x?: number;
        y?: number;
    }): void;
    colorToId(colors: number[]): number | undefined;
    idToColor(id: number): number[];
    __GetPixelId: (this: PixelManipulator, d: Uint32Array) => getPixelId;
    __GetPixel(getPixelId: getPixelId): getPixel;
    update(): void;
    compareColors(a: number[], b: number[]): boolean;
    __ConfirmElm(getPixelId: getPixelId): confirmElm;
    __MooreNearbyCounter(f: confirmElm): mooreNearbyCounter;
    __WolframNearbyCounter(f: confirmElm): wolframNearbyCounter;
    renderPixel(x: number, y: number, id: number): void;
    setPixel(x: number, y: number, arry: string | number | number[], loop?: boolean): void;
    pixelCounts: {
        [index: number]: number;
    };
    iterate(): void;
    imageData: ImageData | undefined;
    ctx: CanvasRenderingContext2D | null;
    currentElements: Uint32Array;
    oldElements: Uint32Array;
    zoomelm: HTMLCanvasElement | undefined;
    zoomctx: CanvasRenderingContext2D | null;
    getPixelId: getPixelId | undefined;
    getPixel: getPixel | undefined;
    confirmElm: confirmElm | undefined;
    whatIs: whatIs | undefined;
    updateData(): void;
    canvasPrep(e: {
        canvas: HTMLCanvasElement;
        zoom: HTMLCanvasElement;
    }): void;
}
export declare const version = "4.5.2";
export declare const licence: string;
export {};
