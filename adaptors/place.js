var curly = require('curly');
var common = require('common');
var host = 'localhost:8888';
var url = 'https://maps.googleapis.com/maps/api/place/search/json?location=37.77222,-122.40375&radius=500&types=establishment&name=harbour&sensor=false&key=AIzaSyBhh8gIlEFcTC4tZ2gCfToy_ktLdE6rfrc';

var types = ['short_text', 'rich_text', 'date', 'duration', 'number', 'picture', 'file', 'location', 'multiple_choice', 'single_choice', 'link'];

var strip = function(str) {
	return str.replace(/<.*?>/g, '');
};

common.step([
	function(next) {
		var id = 'NABb1Ox0aeqwkk29dcjif6r';

		var place = {
				fields : [
		        {
		            name: 'Name',
		            value: 'new name'
		        },
		        {
		            name: 'Vicinity',
		            value: ['google']
		        },
		        {
		        	name: 'Types',
		            value: 'establishment'
		        },
		        {
		        	name: 'Location',
		            value: {lat:37.77550, lon:-122.40823}
		        },
		        {
		        	name: 'icon',
		        	value: 'http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png'
		        }
		    ]
		};
		curly.post('{host}/api/items/NAAhtBlrrj539m34a8xgvi', {host: host}).json(place, next);
	},
	function() {
		console.log('places imported at');
	}
], console.error);