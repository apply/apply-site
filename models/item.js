var ITEM = Object.create(require('./model'))
  , APP = GLOBAL.APP
  , common = require('common');

/**
 * Normalizes the item data
 *
 * @param {Object} blob
 * @param {Object} item
 * @return {Object}
 */
ITEM.normalize = function (blob, item) {
  var map = {};

  if (!blob || !item) {
    return null;
  }

  blob.types.forEach(function (type) {
    map[type.name] = type;
  });

  item.fields = item.fields.map(function (field) {
    var type = map[field.name];

    if (type.type === 'location') {
      field.value = {lat: field.value.split(';')[0], lng: field.value.split(';')[1]};
    }

    if (type.options) {
      field.options = type.options;
    }

    field.type = type.type;

    return field;
  });

  return item;
}

/**
 * Creates an item
 *
 * @param {Object} item
 * @param {String} blobId
 * @param {Function} callback
 * @return {Object}
 */
ITEM.create = function (item, blobId, callback) {
  item.blobId = blobId;
  item.id = ITEM.id();
  item.createdAt = item.updatedAt = ITEM.now();

  common.step([
    function (next) {
      APP.db.blobs.findOne({id: blobId}, next);
    },
    function (blob) {
      if (!blob) {
        return callback([404, new Error('Blob not found')]);
      }

      item = normalize(blob, item);

      if (!item || ITEM.validate(item, {fields: 1})) {
        return callback([400, new Error('Missing item or malformed')]);
      }

      APP.db.items.save(item, function (error) {
        if (error) {
          callback([500, error]);
        } else {
          callback(null, item);
        }
      });
    }
  ], callback);

  return ITEM;
};

/**
 * Updates an item
 *
 * @param {String} blobId
 * @param {String} itemId
 * @param {Object} item
 * @param {Function} callback
 * @return {Object}
 */
ITEM.update = function (blobId, itemId, item, callback) {
  common.step([
    function (next) {
      APP.model('blob').findById(blobId, next);
    },
    function (blob) {
      item = normalize(blob, item);

      if (!item || ITEM.validate(item, {fields: 1})) {
        return callback([400, Error('Missing or malformed item')]);
      }

      // TODO: pubsub.publish(item);
      APP.db.items.update({id: itemId}, {$set: {fields: item.fields, updatedAt: ITEM.now()}}, function (error) {
        if (error) {
          callback([500, error]);
        } else {
          callback(item);
        }
      });
    }
  ], callback);
};

/**
 * Gets a list of items
 *
 * @param {Object} options
 * @param {Function} callback
 * @return {Object}
 */
ITEM.list = function (options, callback) {
  var search = options['search[full_text]'];

  // TODO: Refucktor this, elastic search please
  if (search) {
    common.step([
      function (next) {
        APP.db.items.find({blobId: options.blobId}, {_id: 0}, next);
      },
      function (items) {
        var is = [];
        items.forEach(function (item) {
          item.fields.some(function (field) {
            var found = (field.value + '').toLowerCase().indexOf(search.toLowerCase()) > -1;
            if (found) {
              is.push(item);
            }
            return found;
          });
        });
        callback(null, is);
      }
    ], callback);
  } else {
    APP.db.items.find({blobId: options.blobId}, {_id: 0}, callback);
  }

  return ITEM;
}

/**
 * Gets a single item
 *
 * @param {Object} options
 * @param {Function} callback
 * @return {Object}
 */
ITEM.findById = function (blobId, itemId, callback) {
  common.step([
    function (next) {
      APP.model('blob').findById(blobId, next);
    },
    function (blob) {
      APP.db.items.findOne({id: itemId, blobId: blob.id}, {_id: 0}, function (error, data) {
        if (error) {
          callback([500, error]);
        } else {
          if (data) {
            callback(null, data);
          } else {
            callback([404, Error('Item not found')]);
          }
        }
      });
    }
  ], callback);
}

module.exports = ITEM;
