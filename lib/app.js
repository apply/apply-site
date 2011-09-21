var dir = require('../dir')
  , env = process.env.NODE_ENV || 'development'
  , config = require(dir.config)[env]
  , db = require('mongojs').connect(config.mongo.connection, config.mongo.collections);

module.exports = {
  db: db
, config: config
, env: env
, model: function (str) {
    return require(dir.models + '/' + str);
  }
};
