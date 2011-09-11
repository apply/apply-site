var curly = require('curly');
var common = require('common');
var host = 'localhost:8888';
var tweep = 'hackdisrupt';

common.step([
	function(next) {
		curly.post(host + '/api/blobs').json({
		    name: 'TC Hackathon Tweets',
		    itemName: 'tweet',
		    types : [
		        {
		            name: 'Text',
		            type: 'rich_text'
		        },
		        {
		            name: 'Source',
		            type: 'short_text'        
		        },
		        {
		            name: 'Date',
		            type: 'date'        
		        },
		        {
		        	name: 'Favorited',
		            type: 'single_choice',
		            options: ['yes','no']
		        },
		        {
		        	name: 'Retweeted',
		            type: 'single_choice',
		            options: ['yes','no']
		        },
		        {
		            name: 'Retweet count',
	                type: 'number'
		        }
		    ]
		}, next);
	},
	function(blob, next) {
		this.id = blob.id;
		curly.get('http://api.twitter.com/1/statuses/user_timeline.json?screen_name=' + tweep).json(next);	
	},
	function(tweets, next) {
		var id = this.id;
		tweets = tweets.map(function(tweet) {
			return {
				fields : [
			        {
			            name: 'Text',
			            type: 'rich_text',
			            value: tweet.text
			        },
			        {
			            name: 'Source',
			            type: 'short_text',
			            value: tweet.source
			        },
			        {
			            name: 'Date',
			            type: 'date',
			            value: new Date(tweet.created_at).getTime()
			        },
			        {
			        	name: 'Favorited',
			            type: 'single_choice',
			            options: ['yes','no'],
			            value: tweet.favorited ? 'yes' : 'no'
			        },
			        {
			        	name: 'Retweeted',
			            type: 'single_choice',
			            options: ['yes','no'],
			            value: tweet.retweeted ? 'yes' : 'no'
			        },
			        {
			            name: 'Retweet count',
		                type: 'number',
			            value: tweet.retweet_count
			        }
			    ]
			}
		});
		
		tweets.forEach(function(tweet) {
			curly.post('{host}/api/blobs/{blob}/items', {host: host, blob: id}).json(tweet, next.parallel());
		});
	},
	function() {
		console.log('tweets imported at', this.id);
	}
], console.error);