require('colors');

var dir = require('../dir')
  , time = new Date()
  , remove_done = 0
  , APP, collections, db;

APP = require(dir.lib + '/app');
db = APP.db;
collections = APP.config.mongo.collections;

function done() {
  remove_done += 1;
  if (remove_done === collections.length) {
    console.log(' ' + ((new Date() - time) + 'ms\n').blue);
    process.exit();
  }
}

console.log('Clearing the database...'.yellow);
collections.forEach(function (collection) {
  db[collection].remove(done);
});
