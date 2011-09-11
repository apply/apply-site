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
    var li = field.value.reduce(function (memo, el) {
          return memo + '<li>' + el + '</li>';
        }, '');
    return '<div class="multi_choice"><ul>' + li + '</ul></div>';
  case 'single_choice':
    return '<div class="single_choice">' + field.value + '</div>';
  case 'link':
    return '<div class="link"><a href="' + field.value + '" /></div>';
  };
};

STATIC.renderFormField = function (type, value) {
  var name = type.name.toLowerCase()
    , id = 'item_' + name;

  value = value || '';

  switch (type.type) {
  case 'short_text':
    return '<label for="' + id + '">' + type.name + '</label>'
         + '<input type="text" id="' + id + '" name="item[' + name + ']" value="' + value + '" />';
  case 'rich_text':
    return '<label for="' + id + '">' + type.name + '</label>'
         + '<textarea id="' + id + '" name="item[' + name + ']">' + value + '</textarea>';
  case 'date':
    return '<label for="' + id + '">' + type.name + '</label>'
         + '<input class="date" type="date" id="' + id + '" name="item[' + name + ']" value="' + value + '" />';
  case 'duration':
    return '<label for="' + id + '">' + type.name + '</label>'
         + '<input class="duration" type="text" id="' + id + '" name="item[' + name + '][value]" value="' + value + '" />'
         + '<select name="item[' + name + '][units]">'
           + '<option value="years">years</option>'
           + '<option value="months">months</option>'
           + '<option value="weeks">weeks</option>'
           + '<option value="days">days</option>'
           + '<option value="hours">hours</option>'
           + '<option value="minutes">minutes</option>'
           + '<option value="seconds">seconds</option>'
         + '</select>';
  case 'number':
    return '<label for="' + id + '">' + type.name + '</label>'
         + '<input class="number" type="number" id="' + id + '" name="item[' + name + ']" value="' + value + '" />';
  case 'picture':
    return '<label for="' + id + '">' + type.name + '</label>'
         + '<input class="picture" type="file" id="' + id + '" name="item[' + name + ']" value="' + value + '" />';
  case 'file':
    return '<label for="' + id + '">' + type.name + '</label>'
         + '<input class="file" type="file" id="' + id + '" name="item[' + name + ']" value="' + value + '" />';
  case 'location':
    return 'TODO: MAP';
  case 'multi_choice':
    var options = type.options.reduce(function (memo, el) {
          return memo + '<options value="' + el + '">' + el + '</options>';
        }, '');
    return '<label for="' + id + '">' + type.name + '</label>'
         + '<select name="item[' + name + '][units]" multiple>'
           + options
         + '</select>';
  case 'single_choice':
    var options = type.options.reduce(function (memo, el) {
          return memo + '<options value="' + el + '">' + el + '</options>';
        }, '');
    return '<label for="' + id + '">' + type.name + '</label>'
         + '<select name="item[' + name + '][units]">'
           + options
         + '</select>';
  case 'link':
    return '<label for="' + id + '">' + type.name + '</label>'
         + '<input class="url" type="url" id="' + id + '" name="item[' + name + ']" value="' + value + '" />';
  };
};

module.exports = STATIC;
