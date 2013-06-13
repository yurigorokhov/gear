/**
 * Created with JetBrains PhpStorm.
 * User: yurig
 * Date: 6/6/13
 * Time: 2:18 PM
 * To change this template use File | Settings | File Templates.
 */

var User = function(data) {
    if(_(data.email).isEmpty()) {
        throw 'Email cannot be empty';
    }
    if(_(data.password).isEmpty()) {
        throw 'Password cannot be empty';
    }
    this.username = data.username;
    this.email = data.email;
};

_(User).extend({
    createUser: function(data) {
        var def = Q.defer();
        data.username = data.email;
        var u = new User(data);
        parseApp.insertCustom('users', data, function (err) {
            if(err) {
                def.reject(err);
            } else {
                def.resolve(u);
            }
        });
        return def.promise;
    }
});
exports.User = User;