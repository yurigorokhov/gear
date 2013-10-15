Gear.provide('Gear.Permissions');
_(Gear.Permissions).extend({
    getPermissions: function(folder) {
        var def = Q.defer();
        db.permissions.findOne({ folder: folder }, function(err, folderPermission) {
            if(err) {
                def.reject(new Gear.Error('Failed to fetch permissions'));
            } else {
                def.resolve(folderPermission || {});
            }
        });
        return def.promise;
    },
    setPermissions: function(folder, permissions) {
        var def = Q.defer();

        // Get current permission for folder
        db.permissions.remove({folder: folder}, function() {
            permissions.folder = folder;
            db.permissions.save(permissions, function() {
                def.resolve();
            });
        });
        return def.promise;
    }
});