var curly = require('curly');
var common = require('common');
var host = 'localhost:8888';
var url = 'http://feeds.feedburner.com/techcrunch/startups?format=xml';
var parser = require('xml2json');

var types = ['short_text', 'rich_text', 'date', 'duration', 'number', 'picture', 'file', 'location', 'multiple_choice', 'single_choice', 'link'];

var strip = function(str) {
	return str.replace(/<.*?>/g, '');
};

common.step([
	function(next) {
		curly.post(host + '/api/blobs').json({
		    name: 'Startups',
		    itemName: 'Potential Competitor',
		    types : [
		        {
		            name: 'Title',
		            type: 'short_text'
		        },
		        {
		            name: 'Description',
		            type: 'rich_text'        
		        },
		        {
		        	name: 'Link',
		            type: 'link'
		        },
		        {
		        	name: 'Creator',
		            type: 'single_choice',
		            options: [ 'MG Siegler',
					  'Semil Shah',
					  'Contributor',
					  'Rip Empson',
					  'Sarah Perez',
					  'Leena Rao',
					  'Robin Wauters' ] 
		        },
		        {
		        	name:'Number of Categories',
		        	type: 'number'
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

		var posts = results.rss.channel.item.map(function(post) {
			return {
				fields : [
		        {
		            name: 'Title',
		            type: 'short_text',
		            value: strip(post.title)
		        },
		        {
		            name: 'Description',
		            type: 'rich_text',
		            value: strip(post.description)
		        },
		        {
		        	name: 'Link',
		            type: 'link',
		            value: post.link
		        },
		        {
		        	name: 'Creator',
		            type: 'single_choice',
		            value: post['dc:creator']
		        },
		        {
		        	name:'Number of Categories',
		        	type: 'number',
		        	value: post.category.length
		        }
		    ]
			};
		});
		
		posts.forEach(function(post) {
			console.log('importing: ', post);
			curly.post('{host}/api/blobs/{blob}/items', {host: host, blob: id}).json(post, next.parallel());
		});
	},
	function() {
		console.log('poatential competitors imported at', this.id);
	}
], console.error);