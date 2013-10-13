Gear.provide('Gear.Permissions');
_(Gear.Permissions).extend({
    addPermission: function(folder, user, permission) {
        var def = Q.defer();

        // Check if the user exists
        Gear.Users.getUser(user).then(function() {

            // Get current permission for folder
            db.permissions.find({ folder: folder }, function(err, folderPermission) {
                if(err) {
                    def.reject(new Gear.Error('Failed to fetch permission'));
                } else {
                    if(!_(folderPermission).isEmpty()) {
                        var obj = {};
                        obj[user] = permission;
                        db.permissions.findAndModify({
                            query: { folder: folder },
                            update: { $set: obj }
                        });
                    } else {
                        var obj = {folder: folder};
                        obj[user] = permission
                        db.permissions.save(obj);
                    }
                    def.resolve();
                }
            });
        }).fail(function(err) {
           def.reject(err);
        });
        return def.promise;
    }
});