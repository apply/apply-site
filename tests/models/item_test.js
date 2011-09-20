var testosterone = require('testosterone')({ sync: true
                                           , title: 'models/item'
                                           , output: {specs: true}})
  , assert = testosterone.assert
  , gently = global.GENTLY = new (require('gently'))
  , dir = require('../../dir')

    // mocks
  , models = {}
  , db = {}
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

  .run();
