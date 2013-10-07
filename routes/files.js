exports.list = function(req, res) {
    var def = Q.defer();
    var dir = Gear.Files.getPathFromRequest(req);
    Gear.Files.pathExists(dir).then(function(stats) {
        if(!stats.isDirectory()) {
            def.reject(new Gear.Error('Path is not a directory'));
        } else {
            Gear.Files.readDir(dir).then(function(files) {
                def.resolve(files);
            }).fail(function(error) {
                    def.reject(new Gear.Error(error));
            }).done();
        }
    }).fail(function() {
        def.reject(new Gear.Error(404, 'File path was not found'));
    }).done();
    return def.promise;
};

exports.get = function(req, res) {
    var def = Q.defer();
    var filePath = Gear.Files.getPathFromRequest(req);
    Gear.Files.pathExists(filePath).then(function(stats) {
        if(stats.isDirectory()) {
            def.reject('The file you requested is a directory');
        } else {
            def.resolve(new Gear.File(filePath, stats.size));
        }
    }).fail(function() {
        def.reject(404, 'File path was not found');
    }).done();
    return def.promise;
};