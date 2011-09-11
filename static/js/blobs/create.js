var $ = require('jQuery', 'jquery-ui');

$(function () {

  function onDelete() {
    $(this).parent().remove();
    return false;
  }

 $('#creator').submit(function() {
    var post = {types:[]};

    post.name = $('#blob_name').val();
    post.itemName = $('#blob_item_name').val();

    $(this).find('fieldset.types_to li.type').each(function(i, el) {
      post.types.push({
        name: $(el).find('input.value').val(),
        type: $(el).find('input.type').val()
      });
    });

    $.ajax({
      type:'POST',
      url:'/api/blobs',
      data:JSON.stringify(post),
      dataType:'json',
      success:function(blob) {
        window.location = '/blobs/'+blob.id;
      }
    });
    return false;
  });

  $('fieldset.types_to ul').sortable({handle: 'img.drag', opacity: 0.8});

  $('fieldset.types_from li.type a').click(function () {
    var $this = $(this)
      , klass = $this.attr('class')
      , $types_to = $('fieldset.types_to ul')
      , $cloned = $types_to.find('li.type').eq(0).clone(true)
      , $cloned_img = $cloned.find('img.type');

    $cloned_img.attr('src', $cloned_img.attr('src').replace(/(\/images\/types\/).*?(\.png)/, '$1' + klass + '$2'));
    $cloned.find('input.type').val(klass);
    $cloned.append('<a class="delete" href="#">delete</a>');
    $cloned.prepend('<img class="drag" src="/images/drag.png" alt="drag" />');
    $cloned.find('a.delete').click(onDelete);
    $types_to.append($cloned);
    return false;
  });
});
