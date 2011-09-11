var curly = require('curly');
var common = require('common');
var host = 'localhost:8888';
var url = 'http://feeds.feedburner.com/techcrunch/startups?format=xml';

var parser = require('xml2json');

var types = ['short_text', 'rich_text', 'date', 'duration', 'number', 'picture', 'file', 'location', 'multiple_choice', 'single_choice', 'link'];

var strip = function(str) {
	return str.replace(/<.*?>/g, '');
};

var unique =  function(ar) {
    var a = [];
    var l = ar.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        // If this[i] is found later in the array
        if (ar[i] === ar[j])
          j = ++i;
      }
      a.push(ar[i]);
    }
    return a;
  };
common.step([
	function(next) {
		curly.get(url, next);	
	},
	function(xml, next) {
		var results = JSON.parse(parser.toJson(xml));
		
		var a = [];
		for(var name in results.rss.channel.item) {
			//console.log(results.rss.channel.item[name].title);
			a.push(results.rss.channel.item[name]['dc:creator']);
			
		}
		console.log(unique(a));
		console.log(results.rss.channel.item[0]);
		console.log(strip(results.rss.channel.item[0].description));
		console.log(strip(results.rss.channel.item[0].title));
		console.log(results.rss.channel.item[0].link);
		console.log(results.rss.channel.item[0].category.length);
		console.log(results.rss.channel.item[0]['dc:creator']);
	}
], console.error);