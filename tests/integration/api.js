var testosterone = require('testosterone')({ title: 'inetgration/api'
                                           , output: {specs: true}})
  , assert = testosterone.assert
  , gently = global.GENTLY = new (require('gently'))
  , dir = require('../../dir')
  , api = require(dir.root + '/api-server')
  , request = require('request')
  , host = 'http://localhost:8888'
  , server = require('router').create();

api.use(server);
server.listen(8888);

testosterone

  .add('`/api/blobs#POST` create blob', function (done) {
    var funk = require('funk')('parallel')
      , blob = {name: 'people', itemName: 'person', types: [{name: 'Name', type: 'shortText'}], view: 'map'};

    request({uri: host + '/api/blobs', method: 'POST', json: {}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 400);
    }));

    request({uri: host + '/api/blobs', method: 'POST', json: {foo: 'bar'}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 400);
    }));

    gently.expect(require(dir.models + '/blob'), 'id', function () {
      return '42';
    });

    request({uri: host + '/api/blobs', method: 'POST', json: blob}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 200);
      assert.equal(body.name, blob.name);
      assert.equal(body.id, '42');
    }));

    funk.run(done, done);
  })

  .add('`/api/blobs#GET` lists blobs', function (done) {
    request({uri: host + '/api/blobs', method: 'GET', json: {}}, function (error, res, body) {
      assert.equal(res.statusCode, 200);
      assert.equal(body.length, 1);
      assert.equal(body[0].name, 'people');
      done();
    });
  })

  .add('`/api/blobs/{blobId}#POST` updates blob', function (done) {
    var funk = require('funk')('parallel')
      , update = {view: 'grid'};

    request({uri: host + '/api/blobs/42', method: 'POST', json: {}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 400);
    }));

    request({uri: host + '/api/blobs/42', method: 'POST', json: {foo: 'bar'}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 400);
    }));

    request({uri: host + '/api/blobs/666', method: 'POST', json: update}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 404);
    }));

    request({uri: host + '/api/blobs/42', method: 'POST', json: update}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 200);
      assert.equal(body.id, '42');
      assert.equal(body.view, 'grid');
    }));

    funk.run(done, done);
  })

  .add('`/api/blobs/{blobId}#GET` gets a blob', function (done) {
    var funk = require('funk')('parallel');

    request({uri: host + '/api/blobs/666', method: 'GET', json: {}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 404);
    }));

    request({uri: host + '/api/blobs/42', method: 'GET', json: {}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 200);
      assert.equal(body.id, '42');
      assert.equal(body.view, 'grid');
    }));

    funk.run(done, done);
  })

  .add('`/api/blobs/{blobId}/items#POST` insert an item within a blob', function (done) {
    var funk = require('funk')('parallel')
      , item = {fields: [{type: 'shortText', name: 'Name', value: 'Zemba'}]};

    request({uri: host + '/api/blobs/666/items', method: 'POST', json: item}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 404);
    }));

    request({uri: host + '/api/blobs/42/items', method: 'POST', json: {}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 400);
    }));

    request({uri: host + '/api/blobs/42/items', method: 'POST', json: {f: 'b'}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 400);
    }));

    gently.expect(require(dir.models + '/item'), 'id', function () {
      return '33';
    });

    request({uri: host + '/api/blobs/42/items', method: 'POST', json: item}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(body.fields, item.fields);
      assert.equal(body.id, '33');
    }));

    funk.run(done, done);
  })

  .add('`/api/blobs/{blobId}/items/{itemId}#POST` update an item within a blob', function (done) {
    var funk = require('funk')('parallel')
      , item = {fields: [{type: 'shortText', name: 'Name', value: 'Fleiba'}]};

    request({uri: host + '/api/blobs/666/items/33', method: 'POST', json: item}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 404);
    }));

    request({uri: host + '/api/blobs/42/items/666', method: 'POST', json: item}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 404);
    }));

    request({uri: host + '/api/blobs/42/items', method: 'POST', json: {}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 400);
    }));

    request({uri: host + '/api/blobs/42/items', method: 'POST', json: {f: 'b'}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 400);
    }));

    request({uri: host + '/api/blobs/42/items/33', method: 'POST', json: item}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(body.fields[0].value, 'Fleiba');
      assert.equal(body.id, '33');
    }));

    funk.run(done, done);
  })

  .add('`/api/blobs/{blobId}/items/{itemId}#GET` get an item within a blob', function (done) {
    var funk = require('funk')('parallel')
      , item = {fields: [{type: 'shortText', name: 'Name', value: 'Fleiba'}]};

    request({uri: host + '/api/blobs/666/items/33', method: 'GET', json: item}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 404);
    }));

    request({uri: host + '/api/blobs/42/items/666', method: 'GET', json: item}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 404);
    }));

    request({uri: host + '/api/blobs/42/items/33', method: 'GET', json: item}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(body.fields[0].value, 'Fleiba');
      assert.equal(body.id, '33');
    }));

    funk.run(done, done);
  })

  .add('`/api/blobs/{blobId}/items#GET` get all items within a blob', function (done) {
    var funk = require('funk')('parallel')
      , item = {fields: [{type: 'shortText', name: 'Name', value: 'Fleiba'}]};

    request({uri: host + '/api/blobs/666/items', method: 'GET', json: item}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 404);
    }));

    request({uri: host + '/api/blobs/42/items', method: 'GET', json: item}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(body[0].fields[0].value, 'Fleiba');
      assert.equal(body.length, 1);
    }));

    funk.run(done, done);
  })

  .run();
