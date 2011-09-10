var server = require('router').create();
var bark = require('bark');
var db = require('mongojs').connect('mongodb://root:root@staff.mongohq.com:10041/apply');

server.get('/css/*.css', bark.stylus('./static/style/{*}.styl'));

server.listen(8080);