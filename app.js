
/**
 * Module dependencies.
 */

Gear = {};
http = require('http');
path = require('path');
fs = require('fs');
_ = require('underscore');
Q = require('q');
mime = require('mime');
crypto = require('crypto');
_.mixin(require('underscore.string').exports());

require('./api/api.js');
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , files = require('./routes/files');

// entities
User = require('./entities/user').User;

// load config
config = {
    mongo: {
        dburl: 'localhost/gear'
    }
};
try {
    eval(fs.readFileSync('config.js', 'utf8'));
    console.log('read config from config.js');
    _(config).extend(configuration);
} catch (e) {
    console.log('config.js does not exist (' + e.message + ')');
    process.exit(1);
}
db = require('mongojs').connect(config.mongo.dburl, ['users', 'authtokens']);

// init app
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Error catching
var wrap = function(func, options) {
    return function(req, res) {
        options = options || {};
        var render = typeof(options.render) === 'undefined' ? false : options.render;
        var loggedin = typeof(options.loggedin) === 'undefined' ? true : options.loggedin;
        console.log(options.loggedin);
        req.gearContext = {};
        Gear.Users.getCurrentUser(req.cookies.authtoken).then(function(user) {
            req.gearContext.currentUser = user;
            if(loggedin && user._anonymous) {
                res.send('You must be logged in to perform this action', 401);
            } else if(render) {
                func(req, res);
            } else {
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
                        res.send(500, 'An unknown error has occurred');
                    }
                });
            }
        }).fail(function() {
            res.send(500, 'An unknown error has occurred');
        });
    };
};

app.get('/', wrap(routes.index, { render: true, loggedin: false }));
app.get('/filebrowser', wrap(routes.filebrowser, { render: true, loggedin: false }));

// files
app.get('/@api/files/list', wrap(files.list));
app.get('/@api/files/get', wrap(files.get));

// Users
app.post('/@api/users', wrap(user.create));
app.get('/@api/users/current', wrap(user.current));
app.get('/@api/users/login', wrap(user.login, { loggedin: false }));
app.get('/@api/users', wrap(user.list));

app.get('/*', function(req, res) {
    res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
