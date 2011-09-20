var MODEL = {}
  , common = require('common');

MODEL.now = function () {
  return (Date.now() / 1000) | 0;
};

MODEL.id = function () {
  return common.encode(Date.now()) + Math.random().toString(36).substr(2);
};

MODEL.validate = function (document, required) {
  for (var i in required) {
    if (!document[i]) {
      return false;
    }
  }
  return true;
};

module.exports = MODEL;
