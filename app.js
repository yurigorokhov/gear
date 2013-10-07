
/**
 * Module dependencies.
 */

Gear = {};
http = require('http');
path = require('path');
fs = require('fs');
_ = require('underscore');
Parse = require('node-parse-api').Parse;
Q = require('q');
mime = require('mime');

require('./api/api.js');
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , files = require('./routes/files');

// entities
User = require('./entities/user').User;

// load config
config = {};
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
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Error catching
var wrap = function(func) {
    return function(req, res) {
        func(req, res).then(function(result) {
            if(result instanceof Gear.File) {
                res.writeHead(200, {
                    'Content-Type': result.getMimeType(),
                    'Content-Length': result.getSize(),
                    'Content-Disposition': 'filename="'+ path.basename(result.getPath()) +'"'
                });
                var readStream = fs.createReadStream(result.getPath());
                readStream.pipe(res);
            } else {
                res.send(result);
            }
        }).fail(function(error) {
            if(error instanceof Gear.Error) {
                res.send(error.getErrorCode(), error.getMessage());
            } else {
                res.send(500, 'An unknown error has occured');
            }
        })
        .done();
    };
};

app.get('/', routes.index);

// files
app.get('/@api/files/list', wrap(files.list));
app.get('/@api/files/get', wrap(files.get));

// Users
app.post('/@api/users', user.create);

app.get('/*', function(req, res) {
    res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
