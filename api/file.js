Gear.provide('Gear.File');
Gear.File = function(path, size) {
    this._path = path;
    this._size = size;
};
_(Gear.File.prototype).extend({
    getMimeType: function() {
        return mime.lookup(this._path);
    },
    getSize: function() {
        return this._size;
    },
    getPath: function() {
        return this._path;
    }
});