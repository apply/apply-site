var BLOB = Object.create(require('./model'))
  , APP = GLOBAL.APP
  , common = require('common');

BLOB.mapping = { map: ['location']
               , grid: ['shortText', 'richText', 'date', 'duration', 'number', 'multipleChoice', 'singleChoice']
               , gallery: ['picture']
               , tabular: ['shortText', 'date', 'duration', 'number', 'multipleChoice', 'singleChoice', 'link']
               };

BLOB.required = {name: 1, itemName: 1, types: 1};

/**
 * Finds a blob with a given id
 *
 * @param {String} blobId
 * @param {Function} callback
 */
BLOB.findById = function (blobId, callback) {
  APP.db.blobs.findOne({id: blobId}, {_id: 0}, function (error, data) {
    if (error) {
      callback(error);
    } else {
      if (data) {
        callback(null, data);
      } else {
        callback([404, Error('Blob not found')]);
      }
    }
  });
};

/**
 * Get available views for a blob
 *
 * @param {Object} blob
 * @return {Array}
 */
BLOB.getAvailableViews = function (blob) {
  var availableViews = [], view, i;

  for (view in BLOB.mapping) {
    for (i = 0; i < blob.types.length; i++) {
      if (BLOB.mapping[view].indexOf(blob.types[i].type) > -1) {
        availableViews.push(view);
        break;
      }
    }
  }
  return availableViews;
};

/**
 * Creates a blob
 *
 * @param {Object} blob
 * @param {Function} callback
 */
BLOB.create = function (blob, callback) {
  if (!blob || !BLOB.validate(blob, BLOB.required)) {
    return callback([400, Error('Missing or malformed blob')]);
  }

  blob.id = BLOB.id();
  blob.updatedAt = blob.createdAt = BLOB.now();
  blob.availableViews = BLOB.getAvailableViews(blob);

  APP.db.blobs.save(blob, function (error, _) {
    if (error) {
      callback(error);
    } else {
      delete blob._id;
      callback(null, blob);
    }
  });
};

/**
 * Updates a blob
 *
 * @param {String} blobId
 * @param {Object} update
 * @param {Function} callback
 */
BLOB.update = function (blobId, update, callback) {
  if (!update || !update.view) {
    return callback([400, Error('Missing or malformed blob update')]);
  }

  update = common.join({view: update.view}, {updatedAt: BLOB.now()});

  common.step([
    function (next) {
      APP.model('blob').findById(blobId, next);
    },
    function (blob) {
      if (!blob) {
        return callback([404, Error('Blob not found')]);
      }

      APP.db.blobs.findAndModify({query: {id: blobId}, update: {$set: update}, 'new': true}, callback);
    }
  ], callback);
};

module.exports = BLOB;
