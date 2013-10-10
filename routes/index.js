
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Gear Management Group', context: req.gearContext });
};
exports.filebrowser = function(req, res) {
    if(req.gearContext.currentUser._anonymous) {
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    } else {
        res.render('filebrowser', { title: 'Gear Management Group - File Browser' });
    }
};