var STATIC = {};

STATIC.getFieldByName = function (item, name) {
  var field;

  item.fields.some(function (el) {
    var has = el.name === name;
    if (has) {
      field = el;
    }
    return has;
  });

  return field || {};
};

STATIC.getFieldByType = function (item, type) {
  var field;

  item.fields.some(function (el) {
    var has = el.type === type;
    if (has) {
      field = el;
    }
    return has;
  });

  return field || {};
};

STATIC.filterFields = function (item, types) {
  var taken = [];

  return types.reduce(function (memo, el) {
    var field;

    if (Array.isArray(el)) {
      el.some(function (e) {
        field = STATIC.getFieldByType(item, e);
        return field && field.type && taken.indexOf(field.type) === -1;
      });
    } else {
      field = STATIC.getFieldByType(item, el);
    }

    if (field && field.type && taken.indexOf(field.type) === -1) {
      memo.push(field);
      taken.push(field.type);
    }

    return memo;
  }, []);
};

STATIC.truncate = function (str, num) {
  var limit = num || 20;

  if (str.length > limit) {
    return str.slice(0, limit) + '...';
  } else {
    return str;
  }
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

STATIC.renderFormField = function (field, value) {
  var name = field.name.toLowerCase()
    , id = 'item_' + name;

  value = value || '';

  switch (field.type) {
  case 'short_text':
    return '<label for="' + id + '">' + field.name + '</label>'
         + '<input type="text" id="' + id + '" name="item[' + name + ']" value="' + value + '" />';
  case 'rich_text':
    return '<label for="' + id + '">' + field.name + '</label>'
         + '<textarea id="' + id + '" name="item[' + name + ']">' + value + '</textarea>';
  case 'date':
    return '<label for="' + id + '">' + field.name + '</label>'
         + '<input class="date" type="date" id="' + id + '" name="item[' + name + ']" value="' + value + '" />';
  case 'duration':
    return '<label for="' + id + '">' + field.name + '</label>'
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
    return '<label for="' + id + '">' + field.name + '</label>'
         + '<input class="number" type="number" id="' + id + '" name="item[' + name + ']" value="' + value + '" />';
  case 'picture':
    return '<label for="' + id + '">' + field.name + '</label>'
         + '<a class="js_file button" href="javascript:void()">upload file</a>';
  case 'file':
    return '<label for="' + id + '">' + field.name + '</label>'
         + '<a class="js_file button" href="javascript:void()">upload file</a>';
  case 'location':
    return 'TODO: MAP';
  case 'multi_choice':
    var options = field.options.reduce(function (memo, el) {
          return memo + '<option value="' + el + '">' + el + '</option>';
        }, '');
    return '<label for="' + id + '">' + field.name + '</label>'
         + '<select name="item[' + name + '][units]" multiple>'
           + '<option value="">Select one or more</option>'
           + options
         + '</select>';
  case 'single_choice':
    var options = field.options.reduce(function (memo, el) {
          return memo + '<option value="' + el + '">' + el + '</option>';
        }, '');
    return '<label for="' + id + '">' + field.name + '</label>'
         + '<select name="item[' + name + '][units]">'
           + '<option value="">Select one</option>'
           + options
         + '</select>';
  case 'link':
    return '<label for="' + id + '">' + field.name + '</label>'
         + '<input class="url" type="url" id="' + id + '" name="item[' + name + ']" value="' + value + '" />';
  };
};

STATIC.renderFilters = function (fields, data) {
  var html;

  data = data || {};

  fields = fields.filter(function (field) {
    return ['short_text', 'rich_text'].indexOf(field.type) === -1;
  });

  html = '<form id="filters"><div id="full_text">';
  if (fields.length) {
    html += '<a class="arrow" href="#"></a>';
  }
  html += '<input type="text" name="search[full_text]" value="' + (data.full_text || '') + '" />';
  html += '</div>';

  html += '<fieldset id="advanced">';
  fields.forEach(function (field) {
    html += '<div class="field">' + STATIC.renderFormField(field) + '</div>';
  });
  html += '</fieldset>';
  html += '</form>';

  return html;
};

module.exports = STATIC;
