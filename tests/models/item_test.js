var testosterone = require('testosterone')({ sync: true
                                           , title: 'models/item'
                                           , output: {specs: true}})
  , assert = testosterone.assert
  , gently = global.GENTLY = new (require('gently'))
  , dir = require('../../dir')

    // mocks
  , noop = function () {}
  , models = {}
  , db = {blobs: {findOne: noop}, items: {save: noop, update: noop}}
  , Item
  , APP;

GLOBAL.APP = APP = {
  db: db
, dir: dir
, model: function (_model) {
    models[_model] = models[_model] || {};
    return models[_model];
  }
};

Item = require(dir.models + '/item');

testosterone

  .add('`normalize` normalizes the item data input', function () {
    var blob = {types: [ {name: 'Address', type: 'location'}
                       , {name: 'Category', type: 'single_choice', options: {choices: ['foo', 'bar']}}
                       ]}
      , item = {fields: [ {name: 'Address', value: '123;456'}
                        , {name: 'Category', value: 'foo'}
                        ]};

    assert.equal(Item.normalize(blob, null), null);
    assert.equal(Item.normalize(null, item), null);

    assert.deepEqual(Item.normalize(blob, item), {
      fields: [
        {name: 'Address', value: {lat: '123', lng: '456'}, type: 'location'}
      , {name: 'Category', value: 'foo', options: {choices: ['foo', 'bar']}, type: 'single_choice'}
      ]
    });
  })

  .add('`create` normalizes and inserts an item to the database', function () {
    var item = {foo: 'bar'}
      , blobId = 123
      , blob = {zemba: 'fleiba'}
      , id = 42
      , now = Date.now()
      , callback;

    function stubIdAndNow() {
      gently.expect(Item, 'id', function () {
        return id;
      });

      gently.expect(Item, 'now', function () {
        return now;
      });
    }

    // error
    stubIdAndNow();
    gently.expect(APP.db.blobs, 'findOne', function (_query, _cb) {
      assert.deepEqual(_query, {id: blobId});
      _cb(Error('foo'));
    });
    callback = gently.expect(function (error) {
      assert.ok(error);
    });
    Item.create(item, blobId, callback);

    // no blob
    stubIdAndNow();
    gently.expect(APP.db.blobs, 'findOne', function (_query, _cb) {
      assert.deepEqual(_query, {id: blobId});
      _cb(null, null);
    });
    callback = gently.expect(function (error) {
      assert.equal(error[0], 404);
    });
    Item.create(item, blobId, callback);

    // no item
    stubIdAndNow();
    gently.expect(APP.db.blobs, 'findOne', function (_query, _cb) {
      assert.deepEqual(_query, {id: blobId});
      _cb(null, blob);
    });
    gently.expect(Item, 'normalize', function (_blob, _item) {
      assert.deepEqual(_blob, blob);
      assert.deepEqual(_item, item);
      return null;
    });
    callback = gently.expect(function (error) {
      assert.equal(error[0], 400);
    });
    Item.create(item, blobId, callback);

    // invalid item
    stubIdAndNow();
    gently.expect(APP.db.blobs, 'findOne', function (_query, _cb) {
      assert.deepEqual(_query, {id: blobId});
      _cb(null, blob);
    });
    gently.expect(Item, 'normalize', function (_blob, _item) {
      assert.deepEqual(_blob, blob);
      assert.deepEqual(_item, item);
      return item;
    });
    gently.expect(Item, 'validate', function (_item, _required) {
      assert.deepEqual(_item, item);
      assert.deepEqual(_required, {fields: 1});
      return false;
    });
    callback = gently.expect(function (error) {
      assert.equal(error[0], 400);
    });
    Item.create(item, blobId, callback);

    // OK
    stubIdAndNow();
    gently.expect(APP.db.blobs, 'findOne', function (_query, _cb) {
      assert.deepEqual(_query, {id: blobId});
      _cb(null, blob);
    });
    gently.expect(Item, 'normalize', function (_blob, _item) {
      assert.deepEqual(_blob, blob);
      assert.deepEqual(_item, item);
      return item;
    });
    gently.expect(Item, 'validate', function (_item, _required) {
      assert.deepEqual(_item, item);
      assert.deepEqual(_required, {fields: 1});
      return true;
    });
    gently.expect(APP.db.items, 'save', function (_item, _cb) {
      assert.deepEqual(_item, item);
      assert.deepEqual(_cb, callback);
    });
    Item.create(item, blobId, callback);
  })

  .add('`update` normalizes and updates an item to the database', function () {
    var blobId = 42
      , itemId = 37
      , blob = {zemba: 'fleiba'}
      , item = {foo: 'bar'}
      , now = Date.now()
      , callback;

    // error
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(Error('foo'));
    });
    callback = gently.expect(function (error) {
      assert.ok(error);
    });
    Item.update(blobId, itemId, item, callback);

    // no item
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(null, blob);
    });
    gently.expect(Item, 'normalize', function (_blob, _item) {
      assert.deepEqual(_blob, blob);
      assert.deepEqual(_item, item);
      return null;
    });
    callback = gently.expect(function (error) {
      assert.equal(error[0], 400);
    });
    Item.update(blobId, itemId, item, callback);

    // invalid item
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(null, blob);
    });
    gently.expect(Item, 'normalize', function (_blob, _item) {
      assert.deepEqual(_blob, blob);
      assert.deepEqual(_item, item);
      return item;
    });
    gently.expect(Item, 'validate', function (_item, _required) {
      assert.deepEqual(_item, item);
      assert.deepEqual(_required, {fields: 1});
      return false;
    });
    callback = gently.expect(function (error) {
      assert.equal(error[0], 400);
    });
    Item.update(blobId, itemId, item, callback);

    // OK
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(null, blob);
    });
    gently.expect(Item, 'normalize', function (_blob, _item) {
      assert.deepEqual(_blob, blob);
      assert.deepEqual(_item, item);
      return item;
    });
    gently.expect(Item, 'validate', function (_item, _required) {
      assert.deepEqual(_item, item);
      assert.deepEqual(_required, {fields: 1});
      return true;
    });
    gently.expect(Item, 'now', function () {
      return now;
    });
    gently.expect(APP.db.items, 'update', function (_query, _update, _cb) {
      assert.deepEqual(_query, {id: itemId});
      assert.deepEqual(_update, {$set: {foo: 'bar', updatedAt: now}});
      assert.deepEqual(_cb, callback);
    });
    Item.update(blobId, itemId, item, callback);
  })

  .add('`list` retrieves a list of items from db', function () {
    var options = {blobId: 42}
      , callback = noop;

    gently.expect(APP.db.items, 'find', function (_query, _fields, _cb) {
      assert.deepEqual(_query, {blobId: 42});
      assert.deepEqual(_fields, {_id: 0});
      assert.deepEqual(_cb, callback);
    });
    Item.list(options, callback);
  })

  .add('`findById` retrieves a single item with the given id', function () {
    var blobId = 42
      , itemId = 37
      , blob = {zemba: 'fleiba', id: 'foo'}
      , item = {foo: 'bar'}
      , callback;

    // error
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(Error('foo'));
    });
    callback = gently.expect(function (error) {
      assert.ok(error);
    });
    Item.findById(blobId, itemId, callback);

    // error2
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(null, blob);
    });
    gently.expect(APP.db.items, 'findOne', function (_query, _fields, _cb) {
      assert.deepEqual(_query, {id: itemId, blobId: blob.id});
      assert.deepEqual(_fields, {_id: 0});
      _cb(Error('fooo'));
    });
    callback = gently.expect(function (error) {
      assert.ok(error);
    });
    Item.findById(blobId, itemId, callback);

    // No item found
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(null, blob);
    });
    gently.expect(APP.db.items, 'findOne', function (_query, _fields, _cb) {
      assert.deepEqual(_query, {id: itemId, blobId: blob.id});
      assert.deepEqual(_fields, {_id: 0});
      _cb(null, null);
    });
    callback = gently.expect(function (error) {
      assert.equal(error[0], 404);
    });
    Item.findById(blobId, itemId, callback);

    // Ok
    gently.expect(APP.model('blob'), 'findById', function (_blobId, _cb) {
      assert.equal(_blobId, blobId);
      _cb(null, blob);
    });
    gently.expect(APP.db.items, 'findOne', function (_query, _fields, _cb) {
      assert.deepEqual(_query, {id: itemId, blobId: blob.id});
      assert.deepEqual(_fields, {_id: 0});
      _cb(null, item);
    });
    callback = gently.expect(function (error, _item) {
      assert.ifError(error);
      assert.deepEqual(_item, item);
    });
    Item.findById(blobId, itemId, callback);
  })

  .run();
