_(Gear).extend({
    provide: function(namespaceString) {

        // Pointer to the current namespace to export to.  Start with global.
        var currentNode = global;

        // Split the namespace string into its dot-separated components.
        var parts = namespaceString.split('.');
        for(var i = 0, length = parts.length; i < length; i++) {

            // Set the current namespace node to the already-defined node or a new, empty object.
            currentNode[parts[i]] = currentNode[parts[i]] || {};

            // Advance the current pointer to the newly resolved namespace node object.
            currentNode = currentNode[parts[i]];
        }
        return currentNode;
    }
});
require('./authtokens.js');
require('./utils.js');
require('./error.js');
require('./file.js');
require('./user.js');
require('./files.js');
require('./users.js');