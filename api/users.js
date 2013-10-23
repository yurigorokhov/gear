Gear.provide('Gear.Users');

var encodePassword = function(pass) {
    return crypto.createHash('md5').update(pass).digest("hex");
};

_(Gear.Users).extend({

    _anon: {
        username: 'anonymous',
        name: 'Anonymous',
        admin: false,
        anonymous: true
    },

    getUserList: function(filter) {
        filter = filter || {};
        var def = Q.defer();
        db.users.find(filter, function(err, users) {
           if(err) {
               def.reject(new Gear.Error(err));
           } else {
               def.resolve((users && !_(users).isEmpty()) ? users : null);
           }
        });
        return def.promise;
    },

    getUser: function(username) {
        var def = Q.defer();
        db.users.find({username: username}, function(err, users) {
            if(err) {
                def.reject(new Gear.Error(err));
            } else {
                def.resolve((users && !_(users).isEmpty()) ? users[0] : null);
            }
        });
        return def.promise;
    },

    getCurrentUser: function(authtoken) {
        var def = Q.defer();
        var self = this;
        if(config.mockuser) {
            def.resolve(config.mockuser);
            return def.promise;
        }
        if(!authtoken) {
            def.resolve(self._anon);
        } else {
            Gear.Authtokens.getUserName(authtoken)
                .then(function(username) {
                    if(!username) {
                        def.resolve(self._anon);
                    } else {
                        Gear.Users.getUser(username).then(function(user) {
                            def.resolve(user);
                        }).fail(function(err) {
                            def.reject(err);
                        });
                    }
            });
        }
        return def.promise;
    },

    createUser: function(data) {
        var def = Q.defer();
        var self = this;
        Q.fcall(self.filterUserDataFromRequest, data)
            .then(self.hashPasswordForUser)
            .then(function(newUser) {
                return [newUser, self.getUser(newUser.username)];
            })
            .spread(function(newUser, oldUser) {
                if(oldUser) {
                    newUser.passwordHash = newUser.passwordHash || oldUser.passwordHash;
                    newUser.name = newUser.name || oldUser.name;
                    newUser.admin = newUser.admin || oldUser.admin;
                };
                newUser.admin = newUser.admin || false;
                db.users.remove({username: newUser.username}, function() {
                    db.users.save(newUser, function(err, savedUserData) {
                        if(!err && savedUserData) {
                            def.resolve(savedUserData);
                        } else {
                            def.reject(new Gear.Error('Failed to save user: ' + err));
                        }
                    });
                });
            });
        return def.promise;
    },

    filterUserDataFromRequest: function(data) {
        return {
            username: data.username,
            name: data.name,
            password: data.password,
            admin: data.admin
        };
    },

    hashPasswordForUser: function(data) {
        if(data.password && !_(data.password).isEmpty()) {
            data.passwordHash = encodePassword(data.password)
        }
        delete data.password;
        return data;
    },

    filterUserDataForResponse: function(data) {
        return {
            username: data.username,
            name: data.name,
            admin: data.admin,
            anonymous: data.anonymous
        };
    },

    login: function(authorizationHeader) {
        var def = Q.defer();
        var encodedPart = _(authorizationHeader).chain().words().last().value();
        if(!encodedPart) {
            def.reject(new Gear.Error('Bad authorization header', 400));
        } else {
            var userNamePassword = _(new Buffer(encodedPart, 'base64').toString('ascii')).words(':');
            var username = userNamePassword[0];
            var password = userNamePassword[1];
            if(!username) {
                def.reject(new Gear.Error('Invalid username', 400));
            } else if(!password) {
                def.reject(new Gear.Error('Invalid password', 400));
            } else {

                // Attempt to find the user
                Gear.Users.getUser(username).then(function(user) {
                    if(user.authenticateWithHash(encodePassword(password))) {
                        Gear.Authtokens.getAuthtokenForUser(user.getUserName()).then(function(authtoken) {
                            def.resolve(authtoken);
                        }).fail(function() {
                            def.reject(new Gear.Error('There was a problem logging the user in'));
                        });
                    } else {
                        def.reject(new Gear.Error('Failed to log in', 401));
                    }
                }).fail(function(err) {
                    def.reject(err);
                });
            }
        }
        return def.promise;
    }
});