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

STATIC.renderField = function (field) {
  switch (field.type) {
  case 'short_text':
    return '<div class="short_text">' + field.value + '</div>';
  case 'rich_text':
    return '<div class="rich_text">' + field.value + '</div>';
  case 'date':
    return '<div class="date">' + field.value + '</div>';
  case 'duration':
    return '<div class="duration">' + field.value + '</div>';
  case 'number':
    return '<div class="number">' + field.value + '</div>';
  case 'picture':
    return '<div class="picture"><img src="' + field.value + '" /></div>';
  case 'file':
    return '<div class="file"><a href="' + field.value + '" /></div>';
  case 'location':
    return 'TODO: MAP';
  case 'multi_choice':
    (function () {
      var li = field.value.reduce(function (memo, el) {
            return memo + '<li>' + el + '</li>';
          }, '');
      return '<div class="multi_choice"><ul>' + li + '</ul></div>';
    }());
  case 'single_choice':
    return '<div class="single_choice">' + field.value + '</div>';
  case 'link':
    return '<div class="link"><a href="' + field.value + '" /></div>';
  };
};

module.exports = STATIC;
