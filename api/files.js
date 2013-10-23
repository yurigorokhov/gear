Gear.provide('Gear.Files');

_(Gear.Files).extend({
    getPathFromRequest: function(req) {
        var requestPath = req.query.path || '';
        if(!requestPath || _.str.include(requestPath, '..')) {
            return null;
        };
        var pathParam = decodeURIComponent(requestPath);
        return path.join(config.dataFolder, pathParam);
    },

    getRelativeFilePath: function(filePath) {
        return '/' + path.relative(config.dataFolder, filePath);
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
        var self = this;
        fs.readdir(dirPath, function(err, files) {
            if(err) {
                 def.reject(err);
             } else {
                var result = _(files).map(function(f) {
                    var stats = fs.statSync(path.join(dirPath, f));
                    return {
                        name: f,
                        relativePath: self.getRelativeFilePath(path.join(dirPath, f)),
                        size: stats.size,
                        mime: mime.lookup(path.join(dirPath, f)),
                        isDirectory: stats.isDirectory(),
                        href: '/@api/files/get?path=' + encodeURIComponent(encodeURIComponent(self.getRelativePath(path.join(dirPath, f))))
                    };
                });
                def.resolve(result);
             }
        });
        return def.promise;
    }
});