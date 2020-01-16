/**
 * @author Hasan Yilmaz <github.com/yilmazhasan> <github.com/yilmazhasan>
 */

app = window.app;

$(function () {

  // function to create slider ticks
  var setSliderTicks = function () {
    // slider element
    var $slider = $('.slider');
    var max = $slider.slider("option", "max");
    var min = $slider.slider("option", "min");
    var step = $slider.slider("option", "step");
    var spacing = 100 / (max - min);
    // tick element
    var ticks = $slider.find('div.ticks');

    // remove all ticks if they exist
    $slider.find('.ui-slider-tick-mark-main').remove();
    $slider.find('.ui-slider-tick-mark-text').remove();
    $slider.find('.ui-slider-tick-mark-side').remove();

    // generate ticks          
    for (var i = min; i <= max; i = i + step) {

      // main ticks (whole number)
      if (i % 1 === 0) {
        $('<span class="ui-slider-tick-mark-main"></span>').css('left', (spacing * i) + '%').appendTo(ticks);
        $('<span class="ui-slider-tick-mark-text">' + i + '</span>').css('left', (spacing * i) + '%').appendTo(ticks);
      }
      // side ticks
      else {
        $('<span class="ui-slider-tick-mark-side"></span>').css('left', (spacing * i) + '%').appendTo(ticks);
      }
    }
  };

  app.refreshRangesTable();

  // Initialize
  app.refreshSlider(app.typeNames, app.handles)

  // button for adding new ranges                        
  $('.slider-controller button.add').click(function (e) {
    e.preventDefault();
    // get slider
    var $slider = $('#slider');
    // trigger addHandle event
    app.typeNames[$('#newRangeName').val()] = $('#newRangeName').val()
    let name = $('#newRangeName').val();
    let val = Number($('#newRangeValue').val());
    handles.push({ value: val, type: name });

    app.refreshOutput();

    // $slider.slider('addHandle', {
    //   value: 12,
    //   type: 'custom' //$('#newRange').val()
    //   // type: $('.slider-controller select').val()
    // });
    return false;
  });

  // button for removing currently selected handle
  $('.slider-controller button.remove').click(function (e) {
    e.preventDefault();
    // get slider
    var $slider = $('#slider');
    // trigger removeHandle event on active handle
    $slider.slider('removeHandle', $slider.find('a.ui-state-active').attr('data-id'));

    app.refreshOutput();

    return false;
  });

  // when clicking on handler
  $(document).on('click', '.slider a', function () {
    var select = $('.slider-controller select');
    // enable if disabled
    //select.attr('disabled', false);
    alert($(this).attr('data-type'));

    select.val($(this).attr('data-type'));
    /*if ($(this).parent().find('a.ui-state-active').length)
      $(this).toggleClass('ui-state-active');*/
  });

});
