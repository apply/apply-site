var STATIC = {};

STATIC.getField = function (item, name) {
  var field;

  item.fields.some(function (el) {
    var has = el.name === name;
    if (has) {
      field = el;
    }
    return has;
  });

  return field;
};

module.exports = STATIC;
