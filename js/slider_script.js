/**
 * @author Hasan Yilmaz <github.com/yilmazhasan>
 */

app = window.app;

$(function () {

  app.refreshRangesTable();
  app.refreshSlider(app.typeNames, app.handles);

  // Add a new grade range
  $('.slider-controller button.add').click(function (e) {
    e.preventDefault();
    let name = $('#newRangeName').val().trim();
    let val = Number($('#newRangeValue').val());

    if (!name) {
      app.notify("Please enter a letter name before adding a range.", 'warning');
      return false;
    }
    if (isNaN(val) || val < 0 || val >= 100) {
      app.notify("Start value must be a number between 0 and 99.", 'warning');
      return false;
    }

    app.typeNames[name] = name;
    app.handles.push({ value: val, type: name });  // fixed: was bare `handles` global
    app.refreshOutput();
    return false;
  });

  // Remove the currently active (selected) handle
  $('.slider-controller button.remove').click(function (e) {
    e.preventDefault();
    let $slider = $('#slider');
    let activeId = $slider.find('a.ui-state-active').attr('data-id');
    if (activeId === undefined) {
      app.notify("Click a handle on the slider first to select it, then remove.", 'info');
      return false;
    }
    $slider.slider('removeHandle', activeId);
    app.refreshOutput();
    return false;
  });

  // Clicking a slider handle shows its type in the name input (no blocking alert)
  $(document).on('click', '.slider a', function () {
    let type = $(this).attr('data-type');
    $('#newRangeName').val(type);
    let select = $('.slider-controller select');
    select.val(type);
  });

});
