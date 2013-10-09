/*
 * POST user
 */
exports.create = function(req, res) {
    var def = Q.defer();
    Gear.Users.createUser(req.body).then(function(user) {
        def.resolve(user.toResponseObject());
    }).fail(function(err) {
        def.reject(err);
    });
    return def.promise;
};

exports.list = function(req, res) {
    var def = Q.defer();
    Gear.Users.getUserList().then(function(list) {
        def.resolve(_(list).map(function(u) {
            return u.toResponseObject();
        }));
    }).fail(function(error) {
        def.reject(error);
    });
    return def.promise;
};

exports.login = function(req, res) {
    var def = Q.defer();
    var authorizationHeader = req.headers['authorization'];
    if(!authorizationHeader) {
        def.reject(new Gear.Error('Authorization header is required', 400));
    } else {
        Gear.Users.login(authorizationHeader).then(function(authtoken) {
            def.resolve(authtoken);
        }).fail(function(err) {
            def.reject(err);
        });
    }
    return def.promise;
};