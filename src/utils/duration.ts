export class Duration {
    private millis: number;
  
    constructor(millis: number) {
      this.millis = millis;
    }
  
    static readonly ZERO: Duration = new Duration(0);
  
    static from(params: {
      hours?: number;
      minutes?: number;
      seconds?: number;
      milliseconds?: number;
    }): Duration {
      const { hours = 0, minutes = 0, seconds = 0, milliseconds = 0 } = params;
  
      const sum =
        milliseconds +
        seconds * 1000 +
        minutes * 1000 * 60 +
        hours * 1000 * 60 * 60;
  
      return new Duration(sum);
    }
  
    inHours(): number {
      return this.millis / (60 * 60 * 1000);
    }
  
    inMinutes(): number {
      return this.millis / (60 * 1000);
    }
  
    inSeconds(): number {
      return this.millis / 60;
    }
  
    inMilliseconds(): number {
      return this.millis;
    }
  }
  