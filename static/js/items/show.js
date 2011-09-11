window.setMap = function (options) {
  options = options || {lat: '37.77168', lng: '-122.40422'};

  var mapDiv = document.getElementById('map');
  var map = new google.maps.Map(mapDiv, {
    center: new google.maps.LatLng(options.lat, options.lng),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(options.lat, options.lng),
    draggable: true
  });
};
