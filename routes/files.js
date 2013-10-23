exports.list = function(req, res) {
    var def = Q.defer();
    var dir = Gear.Files.getPathFromRequest(req);
    if(!dir) {
        def.reject(new Gear.Error('Invalid path', 400));
        return def.promise;
    }
    Gear.Files.pathExists(dir).then(function(stats) {
        if(!stats.isDirectory()) {
            def.reject(new Gear.Error('Path is not a directory'));
        } else {
            Gear.Files.readDir(dir)
                .then(function(files) {
                    return Gear.Permissions.filterFilesByUser(files, req.gearContext.currentUser);
                })
                .then(def.resolve)
                .fail(function(error) {
                    def.reject(new Gear.Error(error));
                });
        }
    }).fail(function() {
        def.reject(new Gear.Error(404, 'File path was not found'));
    }).done();
    return def.promise;
};

exports.get = function(req, res) {
    var def = Q.defer();
    var filePath = Gear.Files.getPathFromRequest(req);
    if(!filePath) {
        def.reject(new Gear.Error('Invalid path', 400));
        return def.promise;
    }
    Gear.Files.pathExists(filePath).then(function(stats) {
        if(stats.isDirectory()) {
            def.reject('The file you requested is a directory');
        } else {
            def.resolve(new Gear.File(filePath, stats.size));
        }
    }).fail(function() {
        def.reject(new Gear.Error('File path was not found', 404));
    }).done();
    return def.promise;
};

exports.getPermissions = function(req, res) {
    var def = Q.defer();
    var filePath = Gear.Files.getPathFromRequest(req);
    if(!filePath) {
        def.reject(new Gear.Error('Invalid path', 400));
        return def.promise;
    }
    Gear.Files.pathExists(filePath).then(function(stats) {
        if(!stats.isDirectory()) {
            def.reject(new Gear.Error('This path is not a directory, cannot get permissions', 400));
        } else {
            Gear.Users.getUserList({ admin: false }).then(function(users) {
                Gear.Permissions.getPermissionsForUsers(Gear.Files.getRelativeFilePath(filePath), _(users).pluck('username')).then(function(permissions) {
                    def.resolve(permissions);
                }).fail(function(err) {
                    def.reject(err);
                });
            }).fail(function(err) {
                def.reject(err);
            });
        }
    }).fail(function(err) {
        def.reject(new Gear.Error('File path was not found', 404));
    });
    return def.promise;
};

exports.setPermissions = function(req, res) {
    var def = Q.defer();
    var filePath = Gear.Files.getPathFromRequest(req);
    if(!filePath) {
        def.reject(new Gear.Error('Invalid path', 400));
        return def.promise;
    }
    if(!req.query.user) {
        def.reject(new Gear.Error('User is a required parameter', 400));
        return def.promise;
    }
    Gear.Files.pathExists(filePath).then(function(stats) {
        if(!stats.isDirectory()) {
            def.reject(new Gear.Error('This path is not a directory, cannot add a permission', 400));
        } else {
            Gear.Permissions.setPermissions(Gear.Files.getRelativeFilePath(filePath), req.query.user, req.body).then(function() {
                def.resolve();
            }).fail(function(err) {
                def.reject(err);
            });
        }
    }).fail(function(err) {
        def.reject(new Gear.Error('File path was not found', 404));
    });
    return def.promise;
};