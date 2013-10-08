Gear.provide('Gear.Users');

_(Gear.Users).extend({

    getUserList: function() {
        var def = Q.defer();
        db.users.find({}, function(err, users) {
           if(err || !users) {
               def.reject(new Gear.Error('No users were found: ' + err));
           } else {
               def.resolve(users);
           }
        });
        return def.promise;
    }

});