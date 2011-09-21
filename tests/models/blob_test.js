var testosterone = require('testosterone')({ sync: true
                                           , title: 'models/blob'
                                           , output: {specs: true}})
  , assert = testosterone.assert
  , gently = global.GENTLY = new (require('gently'))
  , dir = require('../../dir')

    // mocks
  , noop = function () {}
  , models = {}
  , db = {blobs: {findOne: noop, findAndModify: noop}, items: noop}
  , Blob
  , APP;

GLOBAL.APP = APP = {
  db: db
, dir: dir
, model: function (_model) {
    models[_model] = models[_model] || {};
    return models[_model];
  }
};

Blob = require(dir.models + '/blob');

testosterone

  .add('`findById` finds a blob with the given id', function () {
    var blobId = 42
      , blob = {foo: 'bar'}
      , callback;

    // error
    gently.expect(APP.db.blobs, 'findOne', function (_query, _fields, _cb) {
      assert.deepEqual(_query, {id: 42});
      assert.deepEqual(_fields, {_id: 0});
      _cb(Error('foooo'));
    });
    callback = gently.expect(function (error) {
      assert.ok(error);
    });
    Blob.findById(blobId, callback);

    // no blob
    gently.expect(APP.db.blobs, 'findOne', function (_query, _fields, _cb) {
      assert.deepEqual(_query, {id: 42});
      assert.deepEqual(_fields, {_id: 0});
      _cb(null, null);
    });
    callback = gently.expect(function (error) {
      assert.equal(error[0], 404);
    });
    Blob.findById(blobId, callback);

    // Ok
    gently.expect(APP.db.blobs, 'findOne', function (_query, _fields, _cb) {
      assert.deepEqual(_query, {id: 42});
      assert.deepEqual(_fields, {_id: 0});
      _cb(null, blob);
    });
    callback = gently.expect(function (error, _blob) {
      assert.ifError(error);
      assert.deepEqual(_blob, blob);
    });
    Blob.findById(blobId, callback);
  })

  .add('`getAvailableViews` gets the available views for a given blob', function () {
    assert.deepEqual(
      Blob.getAvailableViews({types: [{type: 'location'}, {type: 'picture'}]})
    , ['map', 'gallery']
    );
    assert.deepEqual(
      Blob.getAvailableViews({types: [{type: 'shortText'}]})
    , ['grid', 'tabular']
    );
    assert.deepEqual(
      Blob.getAvailableViews({types: [{type: 'shortText'}, {type: 'location'}, {type: 'picture'}]})
    , ['map', 'grid', 'gallery', 'tabular']
    );
  })

  .add('`create` inserts a blob to the database', function () {
    var now = Date.now()
      , availableViews = ['map', 'grid']
      , blob = { foo: 'bar'
               , id: 42
               , createdAt: now
               , updatedAt: now
               , availableViews: availableViews
               }
      , id = 42
      , callback;

    function stubIdAndNow() {
      gently.expect(Blob, 'id', function () {
        return id;
      });

      gently.expect(Blob, 'now', function () {
        return now;
      });
    }

    // no blob
    callback = gently.expect(function (error) {
      assert.equal(error[0], 400);
    });
    Blob.create(null, callback);

    // malformed blob
    gently.expect(Blob, 'validate', function (_blob, _required) {
      assert.deepEqual(_blob, blob);
      assert.deepEqual(_required, {name: 1, itemName: 1, types: 1});
      return false;
    });
    callback = gently.expect(function (error) {
      assert.equal(error[0], 400);
    });
    Blob.create(blob, callback);

    // error
    gently.expect(Blob, 'validate', function (_blob, _required) {
      assert.deepEqual(_blob, blob);
      assert.deepEqual(_required, {name: 1, itemName: 1, types: 1});
      return true;
    });
    stubIdAndNow();
    gently.expect(Blob, 'getAvailableViews', function (_blob) {
      assert.deepEqual(_blob, blob);
      return availableViews;
    });
    gently.expect(APP.db.blobs, 'save', function (_blob, _cb) {
      assert.deepEqual(_blob, blob);
      _cb(Error('foo'));
    });
    callback = gently.expect(function (error) {
      assert.ok(error);
    });
    Blob.create(blob, callback);

    // Ok
    gently.expect(Blob, 'validate', function (_blob, _required) {
      assert.deepEqual(_blob, blob);
      assert.deepEqual(_required, {name: 1, itemName: 1, types: 1});
      return true;
    });
    stubIdAndNow();
    gently.expect(Blob, 'getAvailableViews', function (_blob) {
      assert.deepEqual(_blob, blob);
      return availableViews;
    });
    gently.expect(APP.db.blobs, 'save', function (_blob, _cb) {
      assert.deepEqual(_blob, blob);
      _cb(null);
    });
    callback = gently.expect(function (error, _blob) {
      assert.ifError(error);
      assert.deepEqual(blob, _blob);
    });
    Blob.create(blob, callback);
  })

  .add('`update` updates a blob to the database', function () {
    var blobId = 42
      , now = Date.now()
      , update = {view: 'grid', updatedAt: now}
      , blob = {foo: 'bar'}
      , callback;

    // no update
    callback = gently.expect(function (error) {
      assert.equal(error[0], 400);
    });
    Blob.update(blobId, null, callback);

    // malformed update
    callback = gently.expect(function (error) {
      assert.equal(error[0], 400);
    });
    Blob.update(blobId, {foo: 'bar'}, callback);

    // error
    gently.expect(Blob, 'now', function () {
      return now;
    });
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(Error('fuuuu'));
    });
    callback = gently.expect(function (error) {
      assert.ok(error);
    });
    Blob.update(blobId, update, callback);

    // no blob
    gently.expect(Blob, 'now', function () {
      return now;
    });
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(null, null);
    });
    callback = gently.expect(function (error) {
      assert.equal(error[0], 404);
    });
    Blob.update(blobId, update, callback);

    // error on update
    gently.expect(Blob, 'now', function () {
      return now;
    });
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(null, blob);
    });
    gently.expect(APP.db.blobs, 'findAndModify', function (_query, _cb) {
      assert.deepEqual(_query.query, {id: blobId});
      assert.deepEqual(_query.update, {$set: update});
      assert.ok(_query['new']);
      _cb(Error('Fuuuuuuuu'));
    });
    callback = gently.expect(function (error) {
      assert.ok(error);
    });
    Blob.update(blobId, update, callback);

    // Ok
    gently.expect(Blob, 'now', function () {
      return now;
    });
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(null, blob);
    });
    gently.expect(APP.db.blobs, 'findAndModify', function (_query, _cb) {
      assert.deepEqual(_query.query, {id: blobId});
      assert.deepEqual(_query.update, {$set: update});
      assert.ok(_query['new']);
      _cb(null, blob);
    });
    callback = gently.expect(function (error, _blob) {
      assert.ifError(error);
      assert.deepEqual(blob, _blob);
    });
    Blob.update(blobId, update, callback);
  })

  .run();
