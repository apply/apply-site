var curly = require('curly');
var common = require('common');
var host = 'localhost:8888';
var url = 'http://api.flickr.com/services/feeds/photos_public.gne?tage=dogs';
var parser = require('xml2json');

var types = ['short_text', 'rich_text', 'date', 'duration', 'number', 'picture', 'file', 'location', 'multiple_choice', 'single_choice', 'link'];

var strip = function(str) {
	return (str || '').replace(/<.*?>/g, '');
};

common.step([
	function(next) {
		curly.post(host + '/api/blobs').json({
		    name: 'Dogs',
		    itemName: 'Dog',
		    types : [
		        {
		            name: 'Title',
		            type: 'short_text'
		        },
		        {
		            name: 'Author',
		            type: 'short_text'
		        },
		        {
		            name: 'Picture',
		            type: 'picture'        
		        }
		    ]
		}, next);
	},
	function(blob, next) {
		this.id = blob.id;
		curly.get(url, next);	
	},
	function(xml, next) {
		var id = this.id;
		var results = JSON.parse(parser.toJson(xml));
		

		var posts = results.feed.entry.map(function(post) {
			
			var author = post.author || {name:''};
			
			return {
				fields : [
		        {
		            name: 'Title',
		            type: 'short_text',
		            value: strip(post.title || '')
		        },
		        {
		            name: 'Author',
		            type: 'short_text',
		            value: strip(author.name || '')
		        },
		        {
		            name: 'Picture',
		            type: 'picture',
		            value: post.link[post.link.length - 1].href
		        }
		    ]
			};
		});
		
		posts.forEach(function(post) {
			console.log(post);
			curly.post('{host}/api/blobs/{blob}/items', {host: host, blob: id}).json(post, next.parallel());
		});
	},
	function() {
		console.log('poatential competitors imported at', this.id);
	}
], console.error);