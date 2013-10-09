Gear.provide('Gear.Authtokens');
var _authtokenStore = [];
var _getAuthtokenStore = function() {
    var def = Q.defer();
    def.resolve(_authtokenStore);
    return def.promise;
};
_(Gear.Authtokens).extend({
    getUserName: function(authtoken) {
        var def = Q.defer();
        _getAuthtokenStore().then(function(store) {
            var entry = _(store).findWhere({authtoken: authtoken});
            def.resolve(entry ? entry.username : null);
        });
        return def.promise;
    },

    getAuthtokenForUser: function(username) {
        var def = Q.defer();
        _getAuthtokenStore().then(function(store) {
            var entry = _(store).findWhere({username: username});
            if(entry) {
                def.resolve(entry.authtoken);
            } else {
                var g = Gear.Utils.Guid();
                _authtokenStore.push({ username: username, authtoken: g });
                def.resolve(g);
            }
        });
        return def.promise;
    }
});
