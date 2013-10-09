Gear.provide('Gear.User');
Gear.User = function(username, name, passwordHash) {
    this._name = name;
    this._username = username;
    this._passwordHash = passwordHash;
};
_(Gear.User).extend({
   fromData: function(data) {
       return new Gear.User(
           data.username,
           data.name,
           data.passwordHash
       );
   }
});
_(Gear.User.prototype).extend({
    toResponseObject: function() {
        return {
            name: this._name,
            username: this._username
        };
    },
    toDbObject: function() {
        return {
            name: this._name,
            username: this._username,
            passwordHash: this._passwordHash
        };
    },
    authenticateWithHash: function(hash) {
        return (hash == this._passwordHash);
    }
});