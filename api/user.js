Gear.provide('Gear.User');
Gear.User = function(username, name, passwordHash, admin) {
    this._name = name;
    this._username = username;
    this._passwordHash = passwordHash;
    this._admin = admin || false;
    this._anonymous = false;
};
_(Gear.User).extend({
   getAnonymous: function() {
       var user = new Gear.User('Anonymous', 'Anonymous', '', false);
       user._anonymous = true;
       return user;
   },
   fromData: function(data) {
       return new Gear.User(
           data.username,
           data.name,
           data.passwordHash,
           data.admin
       );
   }
});
_(Gear.User.prototype).extend({
    getUserName: function() { return this._username; },
    toResponseObject: function() {
        return {
            name: this._name,
            username: this._username,
            admin: this._admin,
            anonymous: this._anonymous
        };
    },
    toDbObject: function() {
        return {
            name: this._name,
            username: this._username,
            passwordHash: this._passwordHash,
            admin: this._admin
        };
    },
    authenticateWithHash: function(hash) {
        return (hash == this._passwordHash);
    }
});