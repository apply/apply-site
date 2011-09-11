var curly = require('curly');
var common = require('common');
var host = 'localhost:8888';
var url = 'https://maps.googleapis.com/maps/api/place/search/json?location=37.77222,-122.40375&radius=500&types=establishment&name=harbour&sensor=false&key=AIzaSyBhh8gIlEFcTC4tZ2gCfToy_ktLdE6rfrc';

var types = ['short_text', 'rich_text', 'date', 'duration', 'number', 'picture', 'file', 'location', 'multiple_choice', 'single_choice', 'link'];

var strip = function(st) {
	return str.replace(/<.*?>/g, '');
};

common.step([
	function(next) {
		curly.post(host + '/api/blobs').json({
		    name: 'Bussines that need to pay up',
		    itemName: 'place',
		    types : [
		        {
		            name: 'Name',
		            type: 'short_text'
		        },
		        {
		            name: 'Vicinity',
		            type: 'short_text'        
		        },
		        {
		        	name: 'Types',
		            type: 'multiple_choice',
		            options: [ 'lawyer',
					  'finance',
					  'convenience_store',
					  'food',
					  'store',
					  'gas_station',
					  'bus_station',
					  'transit_station',
					  'doctor',
					  'hospital',
					  'health',
					  'school',
					  'establishment'
					 ]
		        },
		        {
		        	name: 'Location',
		            type: 'location'
		        },
		    ]
		}, next);
	},
	function(blob, next) {
		this.id = blob.id;
		curly.get(url).json(next);	
	},
	function(results, next) {
		var id = this.id;
		places = results.results.map(function(place) {
			return {
				fields : [
		        {
		            name: 'Name',
		            type: 'short_text',
		            value: strip(place.name)
		        },
		        {
		            name: 'Vicinity',
		            type: 'short_text',
		            value: strip(place.vicinity)
		        },
		        {
		        	name: 'Types',
		            type: 'multiple_choice',
		            value: place.types
		        },
		        {
		        	name: 'Location',
		            type: 'location',
		            value: place.geometry.location
		        }
		    ]
			}
		});
		
		places.forEach(function(place) {
			console.log('importing: ', place);
			curly.post('{host}/api/blobs/{blob}/items', {host: host, blob: id}).json(place, next.parallel());
		});
	},
	function() {
		console.log('places imported at', this.id);
	}
], console.error);