Gear.provide('Gear.Users');

var encodePassword = function(pass) {
    return crypto.createHash('md5').update(pass).digest("hex");
};

_(Gear.Users).extend({

    getUserList: function() {
        var def = Q.defer();
        db.users.find({}, function(err, users) {
           if(err || !users) {
               def.reject(new Gear.Error('No users were found: ' + err));
           } else {
               def.resolve(_(users).map(function(u) {
                   return Gear.User.fromData(u);
               }));
           }
        });
        return def.promise;
    },

    getUser: function(username) {
        var def = Q.defer();
        db.users.find({username: username}, function(err, users) {
            if(err || !users || !users[0]) {
                def.reject(new Gear.Error('No users were found: ' + err));
            } else {
                def.resolve(Gear.User.fromData(users[0]));
            }
        });
        return def.promise;
    },

    getCurrentUser: function(authtoken) {
        var def = Q.defer();
        if(config.mockuser) {
            def.resolve(Gear.User.fromData(config.mockuser));
            return def.promise;
        }
        if(!authtoken) {
            def.resolve(Gear.User.getAnonymous());
        } else {
            Gear.Authtokens.getUserName(authtoken).then(function(username) {
                if(!username) {
                    def.resolve(Gear.User.getAnonymous());
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
        Gear.Users.getUser(data.username).then(function(user) {
            def.reject(new Gear.Error('User with that name already exists', 409));
        }).fail(function(err) {
            data.passwordHash = encodePassword(data.password);
            var newUser = Gear.User.fromData(data);
            db.users.save(newUser.toDbObject(), function(err, savedUserData) {
                if(!err && savedUserData)
                    def.resolve(Gear.User.fromData(savedUserData));
                else
                    def.reject(new Gear.Error('Failed to save user: ' + err));
                });
        });
        return def.promise;
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