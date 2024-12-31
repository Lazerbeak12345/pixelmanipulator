// See issue https://github.com/ayamflow/fps-control/pull/1
declare module 'fps-control' {
  export default class FPSControl {
    constructor (framerate: number);
    then: Date
    setFPS (value: number): void;
    framerate: number
    check (): boolean;
  }
}
