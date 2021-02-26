var Duration = /** @class */ (function () {
    function Duration(millis) {
        this.millis = millis;
    }
    Duration.from = function (params) {
        var _a = params.hours, hours = _a === void 0 ? 0 : _a, _b = params.minutes, minutes = _b === void 0 ? 0 : _b, _c = params.seconds, seconds = _c === void 0 ? 0 : _c, _d = params.milliseconds, milliseconds = _d === void 0 ? 0 : _d;
        var sum = milliseconds +
            seconds * 1000 +
            minutes * 1000 * 60 +
            hours * 1000 * 60 * 60;
        return new Duration(sum);
    };
    Duration.prototype.inHours = function () {
        return this.millis / (60 * 60 * 1000);
    };
    Duration.prototype.inMinutes = function () {
        return this.millis / (60 * 1000);
    };
    Duration.prototype.inSeconds = function () {
        return this.millis / 60;
    };
    Duration.prototype.inMilliseconds = function () {
        return this.millis;
    };
    Duration.ZERO = new Duration(0);
    return Duration;
}());
export { Duration };
