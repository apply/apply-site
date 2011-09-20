var jsonize = require('jsonize')
  , common = require('common')
  , curly = require('curly')
  , dir = require('./dir')
  , env = process.env.NODE_ENV
  , config = require(dir.config)[env]
  , db = require('mongojs').connect(config.mongo.connection, config.mongo.collections)
  , APP;

APP = {
  db: db
, config: config
, env: env
, model: function (str) {
    return require(config.models + '/' + str);
  }
};

GLOBAL.APP = APP;

function apiResponse(respond) {
  return function (error, data) {
    if (error) {
      if (Array.isArray(error)) {
        respond(error[0], error[1]);
      } else {
        respond(500, error);
      }
    } else {
      respond(data);
    }
  }
}

function callbackify(respond) {
  return function (error, data) {
    if (error) {
      respond(500, error);
    } else {
      respond(data);
    }
  };
}

module.exports.listen = function (server) {

  /**
   * /api/blobs
   * POST
   *
   * Create a new blob
   *
   * Parameter(s)
   * ============
   * none
   *
   * Returns
   * =======
   * Upon success, returns a 200 status code and the JSON representing the created blob.
   *
   * Error Codes
   * ===========
   * 400  Malformed or missing blob.
   * 403  TODO: blob already exists with that id (COLLISION OMG!)
   * 507  TODO: User over quota.
   */
  server.post('/api/blobs', jsonize(function (request, blob, respond) {
    APP.model('blob').create(blob, apiResponse(respond));
  }));

  /**
   * /api/blobs
   * GET
   *
   * Get all the blobs
   *
   * Parameter(s)
   * ============
   * none
   *
   * Returns
   * =======
   * Upon success, returns a 200 status code and the array of blobs you have access to.
   *
   * Error Codes
   * ===========
   * none
   */
  server.get('/api/blobs', jsonize(function (request, respond) {
    db.blobs.find({}, {_id: 0}, callbackify(respond));
  }));

  /**
   * /api/blobs/{blobId}
   * POST
   *
   * Updates a blob
   *
   * Parameter(s)
   * ============
   * blob - An object representing the blob
   *
   * Returns
   * =======
   * Upon success, returns a 200 status code and the JSON representing the updated blob.
   *
   * Error Codes
   * ===========
   * 400 Malformed or missing update.
   * 403 TODO: Operation attempted not allowed by user type (private blob).
   * 404 Blob not found.
   */
  server.post('/api/blobs/{blobId}', jsonize(function (request, blob, respond) {
    APP.model('blob').update(request.params.blobId, blob, apiResponse(respond));
  }));

  /**
   * /api/blobs/{blobId}
   * GET
   *
   * Get a blob
   *
   * Parameter(s)
   * ============
   * hash - Optional. Returns a 304 if the content didn't change.
   *
   * Returns
   * =======
   * Upon success, returns a 200 status code and the blob you have access to.
   *
   * Error Codes
   * ===========
   * 304 TODO: Blob contents have not changed (relies on 'hash' parameter).
   * 403 TODO: Operation attempted not allowed by user type (private blob).
   * 404 Blob not found.
   */
  server.get('/api/blobs/{blobId}', jsonize(function (request, respond) {
    APP.model('blob').findById(request.params.blobId, apiResponse(respond));
  }));

  /**
   * /api/blobs/{blobId}/items
   * GET
   *
   * Get a list of blob's items
   *
   * Parameter(s)
   * ============
   * hash - Optional. Returns a 304 if the contents of a blob didn't change.
   *
   * Returns
   * =======
   * Upon success, returns a 200 status code and the array of items from the blob you have access to.
   *
   * Error Codes
   * ===========
   * 304 TODO: Blob contents have not changed (relies on 'hash' parameter).
   * 403 TODO: Operation attempted not allowed by user type (private blob).
   * 404 TODO: Blob not found.
   */
  server.get('/api/blobs/{blobId}/items', jsonize(function (request, respond) {
    var options = require('url').parse(request.url, true).query;

    options.blobId = request.params.blobId;
    APP.model('item').list(options, apiResponse(respond));
  }));

  /**
   * /api/blobs/{blobId}/items
   * POST
   *
   * Inserts a blob item
   *
   * Parameter(s)
   * ============
   * item - object representing the item to be inserted
   *
   * Returns
   * =======
   * Upon success, returns a 200 status code and the JSON representing the created item.
   *
   * Error Codes
   * ===========
   * 400 Malformed or missing item.
   * 403 TODO: Operation attempted not allowed by user type (private blob).
   * 404 Blob not found.
   */
  server.post('/api/blobs/{blobId}/items', jsonize(function (request, item, respond) {
    APP.model('item').create(item, request.params.blobId, apiResponse(respond));
  }));

  /**
   * /api/blobs/{blobId}/items/{itemId}
   * GET
   *
   * Find an item with a given id
   *
   * Parameter(s)
   * ============
   * None
   *
   * Returns
   * =======
   * Upon success, returns a 200 status code and the JSON representing item.
   *
   * Error Codes
   * ===========
   * 403 TODO: Operation attempted not allowed by user type (private blob).
   * 404 Blob or Item not found.
   */
  server.get('/api/blobs/{blobId}/items/{itemId}', jsonize(function (request, respond) {
    db.items.findById(request.params.blobId, request.params.itemId, apiResponse(respond));
  }));

  /**
   * /api/blobs/{blobId}/items/{itemId}
   * POST
   *
   * Updates an item
   *
   * Parameter(s)
   * ============
   * item - object representing the item to be updated
   *
   * Returns
   * =======
   * Upon success, returns a 200 status code and the JSON representing the updated item.
   *
   * Error Codes
   * ===========
   * 400 Malformed or missing item.
   * 403 TODO: Operation attempted not allowed by user type (private blob).
   * 404 Blob or item not found.
   */
  server.post('/api/blobs/{blobId}/items/{itemId}', jsonize(function (request, item, respond) {
    APP.model('item').update(request.params.blobId, request.params.itemId, item, apiResponse(respond));
  }));

  /**
   * /api/files/{filename}
   * GET
   *
   * Gets a file
   *
   * Parameter(s)
   * ============
   * None
   *
   * Returns
   * =======
   * Upon success, returns a 200 status code and the file.
   *
   * Error Codes
   * ===========
   * 404 File not found.
   */
  server.get('/api/files/{filename}', function (request, response) {
    var name = request.params.filename
      , query = require('url').parse(request.url, true).query;

    common.step([
      function (next) {
        curly.get('http://api.ge.tt/0/{0}/{1}/translate', config.gett.share, name).json(next);
      },
      function (file) {
        var suffix = (query.width || query.height) ? '/scale/' + (query.width || '') + 'x' + (query.height || '') : '';

        curly.get('http://api.ge.tt/0/{0}/{1}/blob' + suffix, config.gett.share, file.fileid).proxy(response);
      }
    ], function () {
      response.writeHead(404);
      response.end();
    });
  });

  /**
   * /api/files/{filename}
   * POST
   *
   * Creates a file
   *
   * Parameter(s)
   * ============
   * None
   *
   * Returns
   * =======
   * Upon success, returns a 200 status code and the file.
   *
   * Error Codes
   * ===========
   * 400 Filename missing
   */
  server.post('/api/files/{filename}', function (request, response) {
    var name = request.params.filename
      , buf, ended = false;

    if (!name) {
      response.writeHead(400);
      response.end('Filename missing');
    }

    request.pause();

    request.once('data', function (data) {
      buf = data;
    });

    request.once('end', function () {
      ended = true;
    });

    common.step([
      function (next) {
        var query = {token: config.gett.token, filename: name};
        curly.get('http://api.ge.tt/1/{0}/create', config.gett.share).query(query).json(next);
      },
      function (file) {
        delete request.headers.host;

        var post = curly.post(file.uploadurl).headers(request.headers);

        function onEnd() {
          response.writeHead(200, {'content-type': 'text/html'});
          response.end('<!DOCTYPE html><html><head></head><body></body></html>');
        };

        request.resume();

        if (buf) {
          post.write(buf);
        }

        if (ended) {
          post.end();
          onEnd();
        } else {
          request.pipe(post);
          request.on('end', onEnd);
        }
      }
    ], function () {
      response.writeHead(500);
      response.end();
    });
  });
};
