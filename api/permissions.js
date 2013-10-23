Gear.provide('Gear.Permissions');
_(Gear.Permissions).extend({
    _permissionsMap: null,
    _defaultPermissions: { read: false, write: false },
    _getPathSegments: function(filePath) {
        return _(filePath).chain().split(path.sep).filter(function(p) { return !_(p).isEmpty(); }).value();
    },
    _getPermissionsMap: function() {
        var def = Q.defer();
        var self = this;
        if(this._permissionsMap == null) {
            db.permissions.find({}).limit(1).toArray(function(err, doc) {
                if(doc.length > 0) {
                    self._permissionsMap = doc[0];
                } else {
                    self._permissionsMap = {};
                }
                def.resolve();
            });
        } else {
            def.resolve();
        }
        return def.promise;
    },
    _getPermissionForUser: function(folder, user) {
        var self = this;
        if(!self._permissionsMap[user]) {
            return self._defaultPermissions;
        } else {
            var userMap = self._permissionsMap[user];
            var level = userMap;
            var segments = this._getPathSegments(folder);
            var permissions = self._defaultPermissions;
            for(var i = 0; i < segments.length; i++) {
                if(level[segments[i]]) {
                    level = level[segments[i]];
                }
                permissions = level.permissions || permissions;
            }
            return permissions;
        }
    },
    getPermissionsForUsers: function(folder, users) {
        var def = Q.defer();
        var self = this;
        this._getPermissionsMap().then(function() {
            var permissions = {};
            _(users).each(function(user) {
                permissions[user] = self._getPermissionForUser(folder, user);
            });
            def.resolve({ users: users, permissions: permissions });
        }).fail(function() {
            def.reject();
        });
        return def.promise;
    },
    getPermissions: function(folder, user) {
        var def = Q.defer();
        var self = this;
        this._getPermissionsMap().then(function() {
            def.resolve(self._getPermissionForUser(folder, user));
        }).fail(function() {
            def.reject();
        });
        return def.promise;
    },
    setPermissions: function(folder, user, permissions) {
        var def = Q.defer();
        var self = this;
        this._getPermissionsMap().then(function() {
            self._permissionsMap = self._permissionsMap || {};
            var level = self._permissionsMap[user];
            _(this._getPathSegments(folder)).each(function(segment) {
                level[segment] = level[segment] || {};
                if(permissions.read === true) {
                    level.permissions = { read: true, write: permissions.write || false };
                }
                level = level[segment];
            });
            level.permissions = permissions;
            db.permissions.remove({}, function() {
                db.permissions.save(self._permissionsMap);
            });
            def.resolve();
        }).fail(function() {
            def.reject();
        });
        return def.promise;
    }
});