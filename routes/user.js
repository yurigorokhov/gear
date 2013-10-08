/*
 * POST user
 */
exports.create = function(req, res) {
    User.createUser(req.body).then(function(user) {
       res.send(user);
    }, function(err) {
        console.log(err);
        res.send(err);
    });
};

exports.list = function(req, res) {
    var def = Q.defer();
    Gear.Users.getUserList().then(function(list) {
        def.resolve(list);
    }).fail(function(error) {
        def.reject(error);
    });
    return def.promise;
};