export declare class Duration {
    private millis;
    constructor(millis: number);
    static readonly ZERO: Duration;
    static from(params: {
        hours?: number;
        minutes?: number;
        seconds?: number;
        milliseconds?: number;
    }): Duration;
    inHours(): number;
    inMinutes(): number;
    inSeconds(): number;
    inMilliseconds(): number;
}
