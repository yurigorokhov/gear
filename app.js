
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user');

http = require('http');
path = require('path');
fs = require('fs');
_ = require('underscore');
Parse = require('node-parse-api').Parse;
Q = require('q');

// entities
User = require('./entities/user').User;

// load config
var config = {};
try {
    eval(fs.readFileSync('config.js', 'utf8'));
    console.log('read config from config.js');
    _(config).extend(configuration);
} catch (e) {
    console.log('config.js does not exist (' + e.message + ')');
    process.exit(1);
}

// init app
var app = express();
parseApp = new Parse(config.parseAppId, config.parseMasterKey);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.compress());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

// Users
app.post('/@api/users', user.create);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
