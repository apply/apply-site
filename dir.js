var dir = {root: __dirname};

// Set dirs constants
['config', 'helpers', 'models', 'static', 'views', 'lib'].forEach(function (path) {
  dir[path] = dir.root + '/' + path;
});

module.exports = dir;
