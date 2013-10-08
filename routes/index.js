
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Gear Management Group' });
};
exports.filebrowser = function(req, res) {
    res.render('filebrowser', { title: 'Gear Management Group - File Browser' });
};