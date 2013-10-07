Gear.provide('Gear.Files');

_(Gear.Files).extend({
    getPathFromRequest: function(req) {
        var pathParam = decodeURIComponent(req.query['path']) || '';
        return path.join(config.dataFolder, pathParam);
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

    readDir: function(path) {
        var def = Q.defer();
        fs.readdir(path, function(err, files) {
            if(err) {
                 def.reject(err);
             } else {
                var result = _(files).map(function(file) {
                    var stats = fs.statSync(path + '/' + file);
                    return {
                        name: file,
                        isDirectory: stats.isDirectory()
                    };
                });
                 def.resolve(result);
             }
        });
        return def.promise;
    }
});