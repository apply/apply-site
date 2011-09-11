var $ = require('jQuery');
require('jquery-ui');

$(function () {

  function onDelete() {
    $(this).parent().remove();
    return false;
  }

  $('fieldset.types_to li.type').sortable();

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
