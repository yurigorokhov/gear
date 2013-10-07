Gear.provide('Gear.Error');
Gear.Error = function(msg, errorCode) {
    this._errorCode = errorCode || 500;
    this._message = msg;
};
_(Gear.Error.prototype).extend({
    getErrorCode: function() {
        return this._errorCode;
    },
    getMessage: function() {
        return this._message;
    }
});