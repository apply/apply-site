var BLOB = Object.create(require('./model'))
  , APP = GLOBAL.APP
  , common = require('common');

BLOB.mapping = { map: ['location']
               , grid: ['short_text', 'rich_text', 'date', 'duration', 'number', 'multiple_choice', 'single_choice']
               , gallery: ['picture']
               , tabular: ['short_text', 'date', 'duration', 'number', 'multiple_choice', 'single_choice', 'link']
               };

/**
 * Finds a blob with a given id
 *
 * @param {String} blobId
 * @param {Function} callback
 * @return {Object}
 */
BLOB.findById = function (blobId, callback) {
  APP.db.blobs.findOne({id: blobId}, {_id: 0}, function (error, data) {
    if (error) {
      callback([500, error]);
    } else {
      if (data) {
        callback(null, data);
      } else {
        callback([404, Error('Blob not found')]);
      }
    }
  });

  return BLOB;
}

/**
 * Creates a blob
 *
 * @param {Object} blob
 * @param {Function} callback
 * @return {Object}
 */
BLOB.create = function (blob, callback) {
  var view, i;

  if (!blob || BLOB.validate(blob, {name: 1, itemName: 1, types: 1})) {
    return callback([400, Error('Missing or malformed blob')]);
  }

  blob.id = BLOB.id();
  blob.createdAt = BLOB.now();
  blob.availableViews = [];

  for (view in BLOB.mapping) {
    for (i = 0; i < blob.types.length; i++) {
      if (BLOB.mapping[view].indexOf(blob.types[i].type) > -1) {
        blob.availableViews.push(view);
        break;
      }
    }
  }

  APP.db.blobs.save(blob, function (error, _) {
    if (error) {
      callback([500, error]);
    } else {
      delete blob._id;
      callback(blob);
    }
  });

  return BLOB;
};

/**
 * Updates a blob
 *
 * @param {String} blobId
 * @param {Object} blob
 * @param {Function} callback
 * @return {Object}
 */
BLOB.update = function (blobId, blob, callback) {
  var update = common.join(blob, {updatedAt: BLOB.now()});

  common.step([
    function (next) {
      APP.model('blob').findById(blobId, next);
    },
    function (blob) {
      if (!blob || BLOB.validate(blob, {name: 1, itemName: 1, types: 1})) {
        return callback([400, Error('Missing or malformed blob')]);
      }

      APP.db.blobs.update({id: blobId}, {$set: update}, function (error) {
        if (error) {
          callback([500, error]);
        } else {
          callback(blob);
        }
      });
    }
  ], callback);

  return BLOB;
};

module.exports = BLOB;
