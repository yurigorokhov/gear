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