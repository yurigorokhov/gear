Gear.provide('Gear.Files');

_(Gear.Files).extend({
    getPathFromRequest: function(req) {
        var pathParam = decodeURIComponent(req.query['path']) || '';
        return path.join(config.dataFolder, pathParam);
    },

    getRelativePath: function(fullPath) {
        return path.relative(config.dataFolder, fullPath);
    },

    pathExists: function(path) {
        var def = Q.defer();
        fs.exists(path, function(exists) {
           if(exists) {
               fs.stat(path, function(err, stats) {
                  if(err) {
                      def.reject();
                  } else {
                      def.resolve(stats);
                  }
               });
           } else {
               def.reject();
           }
        });
        return def.promise;
    },

    readDir: function(dirPath) {
        var def = Q.defer();
        fs.readdir(dirPath, function(err, files) {
            if(err) {
                 def.reject(err);
             } else {
                var result = _(files).map(function(f) {
                    var stats = fs.statSync(path.join(dirPath, f));
                    return {
                        name: f,
                        size: stats.size,
                        mime: mime.lookup(path.join(dirPath, f)),
                        isDirectory: stats.isDirectory(),
                        href: '/@api/files/get?path=' + encodeURIComponent(encodeURIComponent(Gear.Files.getRelativePath(path.join(dirPath, f))))
                    };
                });
                 def.resolve(result);
             }
        });
        return def.promise;
    }
});