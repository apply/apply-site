var file = require('file')
  , marker
  , $ = require('jQuery');

window.setMap = function (options) {
  options = options || {lat: '37.77168', lon: '-122.40422'};

  var mapDiv = document.getElementById('map');
  var map = new google.maps.Map(mapDiv, {
    center: new google.maps.LatLng(options.lat, options.lon),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(options.lat, options.lon),
    draggable: true
  });
}

$(function () {
 $('form').submit(function() { 
    var data = $(this).serialize();
    var action = $(this).attr('action');
    var id = window.location.pathname.split('/')[2];

    if (marker) {
      data += '&item[' + $('#map').prev().text() + ']=' + marker.getPosition().Pa + ';' + marker.getPosition().Qa;    
    }

    $.ajax({
      type:'POST',
      url:'/tojson',
      data: data,
      dataType:'json',
      success:function(blob) {
        $.ajax({
          type:'POST',
          url:action,
          data: JSON.stringify({fields:blob}),
          dataType:'json',
          success:function(data) {
            window.location = '/blobs/'+data.blobid;
          }
        });
      }
    });

    return false;
  });

  file('a.js_file', {
    select: function (url, file_name) {
      $('a.js_file').text('uploading ' + file_name + '...').attr('disabled', true).fadeTo(100, 0.5);
      $('.submit').attr('disabled', true).fadeTo(100, 0.5);
    }
  , upload: function (url, file_name) {
      var $link = $('a.js_file');

      $link
        .text('upload file')
        .attr('disabled', true)
        .fadeTo(100, 1)
        .after('<input type="hidden" name="item[' + $link.prev().text() + ']" value="' + url + '" />')
        .after('<div class="box warning">' + file_name + '</div>');

      $('.submit').attr('disabled', false).fadeTo(100, 1);
    }
  });
});
