var testosterone = require('testosterone')({ title: 'inetgration/api'
                                           , output: {specs: true}})
  , assert = testosterone.assert
  , gently = global.GENTLY = new (require('gently'))
  , api = require('../../api-server')
  , request = require('request')
  , host = 'http://localhost:8888'
  , server = require('router').create();

api.use(server);
server.listen(8888);

testosterone

  .add('`/api/blobs#POST` create blob', function (done) {
    var funk = require('funk')('parallel')
      , blob = {name: 'people', itemName: 'person', types: [{}]};

    request({uri: host + '/api/blobs', method: 'POST', json: {}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 400);
    }));

    request({uri: host + '/api/blobs', method: 'POST', json: {foo: 'bar'}}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 400);
    }));

    request({uri: host + '/api/blobs', method: 'POST', json: blob}, funk.add(function (error, res, body) {
      assert.equal(res.statusCode, 200);
      assert.equal(body.name, blob.name);
      assert.ok(body.id);
    }));

    funk.run(done, done);
  })

  .run();
