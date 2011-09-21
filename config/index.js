['development', 'test', 'production'].forEach(function (el) {
  module.exports[el] = require('./' + el);
});
