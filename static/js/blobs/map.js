var $ = require('jQuery');

var map;

var getFieldByName = function (item, name) {
  var field;

  item.fields.some(function (el) {
    var has = el.name === name;
    if (has) {
      field = el;
    }
    return has;
  });

  return field || {};
};

var getFieldByType = function (item, type) {
  var field;

  item.fields.some(function (el) {
    var has = el.type === type;
    if (has) {
      field = el;
    }
    return has;
  });

  return field || {};
};

var filterFields = function (item, types) {
  var taken = [];

  return types.reduce(function (memo, el) {
    var field;

    if (Array.isArray(el)) {
      el.some(function (e) {
        field = getFieldByType(item, e);
        return field && field.type && taken.indexOf(field.type) === -1;
      });
    } else {
      field = getFieldByType(item, el);
    }

    if (field && field.type && taken.indexOf(field.type) === -1) {
      memo.push(field);
      taken.push(field.type);
    }

    return memo;
  }, []);
};

var markupField = function(fields) {
	[ { "name": "Location", "type": "location", "value": { "lat": 37.993898, "lng": -122.320799 } }, { "name": "Name", "type": "short_text", "value": "Harbour Way Elementary Community Day School" } ]
	
	var markup = '';	
	fields.forEach(function(field) {
		
		switch(field.type) {
			case 'short_text':
				markup += '<p>' + field.value + '</p>';
			break;
			case 'picture':
				markup += '<img src="' + field.value + '" style="widht:100px">';
			break;
		}			
	});

	return markup;
};

$(function() {
  var mapDiv = document.getElementById('map-canvas');
  var map = new google.maps.Map(mapDiv, {
    center: new google.maps.LatLng(37.77199, -122.40366),
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });
  var markers = [];

  items.forEach(function(item) {
  	var fields = filterFields(item, ['location', ['short_text', 'rich_text', 'picture']]);
  	
  	var latLng = new google.maps.LatLng(fields[0].value.lat, fields[0].value.lng);


  	var marker = new google.maps.Marker({
    	map: map,
    	position: latLng
    });

	marker.infowindow = new google.maps.InfoWindow({
		content: markupField(fields)
	});	

	markers.push(marker);

	google.maps.event.addListener(marker, 'click', function() {  
		markers.forEach(function(m) {
			m.infowindow.close();
		});
		marker.infowindow.open(map, marker);
	});
  });
});