
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Gear Management Group', context: req.gearContext });
};
exports.filebrowser = function(req, res) {
    if(req.gearContext.currentUser.anonymous) {
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    } else {
        res.render('filebrowser', { title: 'Gear Management Group - File Browser', context: req.gearContext });
    }
};

exports.users = function(req, res) {
    if(!req.gearContext.currentUser.admin) {
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    } else {
        res.render('users', { title: 'Gear Management Group - Users', context: req.gearContext });
    }
};