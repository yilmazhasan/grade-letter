$(function() {

  // function to create slider ticks
  var setSliderTicks = function() {
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

  function refreshSlider(typeNames, handles) {
  // create slider  
  $('#slider').slider({
    // set min and maximum values
    // day hours in this example
    min: 0,
    max: 100,
    // step
    // quarter of an hour in this example
    step: 0.5,
    // range
    range: false,
    // show tooltips
    tooltips: true,
    // current data
    handles: handles,
    // display type names
    showTypeNames: true,
    typeNames: typeNames,
    // main css class (of unset data)
    mainClass: 'sleep',
    // slide callback
    slide: function(e, ui) {
      console.log(e, ui);
    },
    // handle clicked callback
    handleActivated: function(event, handle) {
      // get select element
      var select = $(this).parent().find('.slider-controller select');
      // set selected option
      select.val(handle.type);
    }

  });

  }

  function refreshRangesTable() {
    let rangesTableBody = $('#currentRanges')[0].children[1]; // 0 is thead, 1 is tbody

    
    while(rangesTableBody.childElementCount) {
      rangesTableBody.deleteRow(0)  // first child is thead
    }

    // rangesTableBody.empty();

    handles.sort((x, y) => x.value < y.value);
   
    for(let i = 0; i < handles.length; i++) {
      let tr = document.createElement("tr");
      let td_name = document.createElement("td");
      let td_val = document.createElement("td");
      let td_count = document.createElement("td");
      td_name.textContent = handles[i].type;
      let from = handles[i].value;
      let to = handles[i+1] ? handles[i+1].value : '100'; // if undefined then it's last element
      td_val.textContent = `[${from}-${to}] : ${(to-from)}%`;
      td_count.textContent = window.categoryFreq[handles[i].type.toUpperCase()] || 0;
      tr.appendChild(td_name);
      tr.appendChild(td_val);
      tr.appendChild(td_count);
      rangesTableBody.append(tr) // .appendChild(tr);
    }

  }

  refreshRangesTable();

  // Initialize
  refreshSlider(typeNames, handles)

  window.refreshRangesTable = refreshRangesTable;
  window.refreshSlider = refreshSlider;

  // button for adding new ranges                        
  $('.slider-controller button.add').click(function(e) {
      e.preventDefault();
      // get slider
      var $slider = $('#slider');
      // trigger addHandle event
      typeNames[$('#newRangeName').val()] = $('#newRangeName').val()
      let name = $('#newRangeName').val();
      let val =Number($('#newRangeValue').val());
      handles.push({value: val, type: name});

      window.refresh();

      // $slider.slider('addHandle', {
      //   value: 12,
      //   type: 'custom' //$('#newRange').val()
      //   // type: $('.slider-controller select').val()
      // });
      return false;
    });

  // button for removing currently selected handle
  $('.slider-controller button.remove').click(function(e) {
      e.preventDefault();
      // get slider
      var $slider = $('#slider');
      // trigger removeHandle event on active handle
      $slider.slider('removeHandle', $slider.find('a.ui-state-active').attr('data-id'));

      window.refresh();

      return false;
    });

  // when clicking on handler
  $(document).on('click', '.slider a', function() {
    var select = $('.slider-controller select');
    // enable if disabled
    //select.attr('disabled', false);
    alert($(this).attr('data-type'));

    select.val($(this).attr('data-type'));
    /*if ($(this).parent().find('a.ui-state-active').length)
      $(this).toggleClass('ui-state-active');*/
  });
  
});

function resizeTextAreas({rowCount}) {
  rowCount = rowCount < 5 ? 5 : rowCount;
  $('#input').attr("rows", rowCount );
  $('#output').attr("rows", rowCount);
}

function input_changed() {
  let input = $('#input').val();
  let inputArray = input.split("\n").filter(x=>x);
  resizeTextAreas({rowCount: inputArray.length+3});

  let numbers = inputArray.map(x => Number(x))
  window.numbers = numbers;
  let errors = [];
  let num = 0;

  numbers.forEach((element,i) => {
    num = Number(element);
    if(num != 0 && !num) {
      errors.push(inputArray[i]);
    }
  })

  if(errors.length) {
    alert( "There are some errors: \n" + errors.join(","))
    return;
  }

  window.categoryDictGradeByNum = getCategories(numbers.slice());

  let categoriesOrderedAsEntered = [];
  
  for(let i = 0; i < numbers.length; i++) {
    categoriesOrderedAsEntered.push(window.categoryDictGradeByNum[numbers[i]]);
  }
  
  console.log(numbers)
  
  writeToOutput(categoriesOrderedAsEntered);
  writeToOutputOrdered(categoriesOrderedAsEntered);
  window.refreshChart();
}

// if there are no type starting from zero, then add a NA grade that starts from zero
function checkHandlesLowBorder() {
  let lowBorder = false;
  let highBorder = false;

  window.handlesWithZero = handles.slice()  // different because we do not want to show zero on slider

  for(handle of handles) {
    if(handle.value == 0) {
      lowBorder = true;
    }
  }

  if(!lowBorder) {
    window.handlesWithZero.push({value: 0, type: "NA"})
    console.log("low border added as NA");
  }

  window.handlesWithZero.sort((x,y) => x.value > y.value ? 1 : -1)
}

window.categoryFreq = {};

function getCategories(numbers) {

  checkHandlesLowBorder()

  numbers.sort((x,y) => x > y ? 1 : -1);

  let totalCount = numbers.length;

  let categoryCounts = [];

  // let descendingSortedHandles = handles.slice().sort((x,y) => x.value > y.value ? -1 : 1)

  for(let i = 0; i < window.handlesWithZero.length; i++) {
    categoryCounts.push({ category: window.handlesWithZero[i].type, 
      count: Math.round(totalCount * ((window.handlesWithZero[i+1]?.value || 100) - window.handlesWithZero[i].value) / 100.0)});
  }
  
  let numOfUncategorizeds = totalCount - categoryCounts.reduce((sum,el) => sum + el.count, 0);

  fineTune(categoryCounts, numbers, numOfUncategorizeds)
  let categorizeds = [];
  
  let categoryCursor = 0
  let numOfCategorized = 0
  
  for(let i = 0; i < totalCount; i++) {
    if(categoryCounts[categoryCursor].count == numOfCategorized) {
      categoryCursor++;
      numOfCategorized = 0;
      i--;
      continue;
    }

    if(!window.handlesWithZero[categoryCursor]) {
      numOfUncategorizeds = totalCount - i;
      break;
    }

    categorizeds.push({number: numbers[i], category: window.handlesWithZero[categoryCursor].type.toUpperCase()});

    numOfCategorized++;
  }

  console.log(categorizeds);

  window.categoryDictGradeByNum = {};

  for(key in window.categoryFreq) {
    window.categoryFreq[key] = 0;
  }

  categorizeds.forEach(el => {
    if(!window.categoryDictGradeByNum[el.number]) {
      window.categoryDictGradeByNum[el.number] = el.category;
    }
    window.categoryFreq[el.category] = (window.categoryFreq[el.category] || 0) + 1;
  })

  refreshRangesTable();

  return window.categoryDictGradeByNum;
}

window.refresh = () => {
  window.refreshSlider(typeNames, handles) // gloabal variables in declared data.js
  window.refreshRangesTable();
  window.refreshChart();
  input_changed();

}


function fineTune(categoryCounts, numbers, numOfUncategorizeds) {
  
  if(numOfUncategorizeds > 0) {
    fineTuneIfUncategorizedExists(categoryCounts, numbers, numOfUncategorizeds);
    return; // since function above will call this function recursively again
  }

  // if categorizeds are more than required, then just decrement starting from lowest grade
  if(numOfUncategorizeds < 0) {
    let cursor = 0; 
    while(numOfUncategorizeds < 0) {
      if(categoryCounts[cursor] && categoryCounts[cursor++].count) { 
        categoryCounts[cursor].count--;
        numOfUncategorizeds++;
      }
      cursor = (cursor + 1) % categoryCounts.length;
    }

    // fineTune(categoryCounts, numbers, numOfUncategorizeds);
    // return; // since function above will call this function recursively again
  }



  // if there are no uncategorizeds, then look for if there are any same number with different category
  // if yes increment to upper and re-finetune
  fineTuneIfSameNumWithDifferentCategory(categoryCounts, numbers, numOfUncategorizeds);
  
  if(numOfUncategorizeds > 0) {
    fineTuneExpandMiddleCategory(categoryCounts, numbers, numOfUncategorizeds);
  }
}

function fineTuneIfSameNumWithDifferentCategory(categoryCounts, numbers, numOfUncategorizeds) {
  
  let cursor = numbers.length-1;  // start from last
  for(let i = categoryCounts.length-1; i >= 0; i--) {
    cursor -= categoryCounts[i].count;
    if(cursor < 0) {
      return;
    }
 
    if(numbers[cursor] == numbers[cursor+1]) {  // here is the diff point, below is low up is high category but same nums
      let prevIndex = i-1;
      while(categoryCounts[prevIndex] && !categoryCounts[prevIndex].count) {
        if(prevIndex <= 0) {
          return;
        }
        prevIndex--;
      }

      if(categoryCounts[prevIndex]) 
      {
        categoryCounts[i].count++;
        categoryCounts[prevIndex].count--;
        fineTune(categoryCounts, numbers, numOfUncategorizeds);
        return;
      }
    }
  }

}

function fineTuneExpandMiddleCategory(categoryCounts, numbers, numOfUncategorizeds) {
  if(numOfUncategorizeds <= 0) {
    console.log("Fine tune complete!");
    return; // finished
  }

  // If there are no uncategorized and same number with different category then increment one of biggest fraction or just middle
  let middle = Math.round(categoryCounts.length / 2);

  while(!categoryCounts[middle]) {
    middle--;

    if(middle < 0) {
      return;
    }
  }

  categoryCounts[middle].count++;

  // since this is our last choice, we don't call fineTune instead call itself until numOfUncategorizeds would be 0
  fineTuneExpandMiddleCategory(categoryCounts, numbers, --numOfUncategorizeds);
}

function fineTuneIfUncategorizedExists(categoryCounts, numbers, numOfUncategorizeds) {

  // first look if there are any category with zero count

  let missingCategories = categoryCounts.filter(x => x.count == 0);
  let missingCategoryWithHighestNum = missingCategories[missingCategories.length-1]; // will return the highest category first

  if(missingCategoryWithHighestNum) {
    missingCategoryWithHighestNum.count++;
    fineTune(categoryCounts, numbers, --numOfUncategorizeds);
  }

  /**
   * Case1: how to distribute surplus?
   * Case2: some same numbers with different categories
   * Case3: there are no highest category or lowest category
   * case4: There are no some categories
   */

}

function writeToOutput(outputArray) {
  $('#output').val(outputArray.join("\n"));
}

function writeToOutputOrdered(numbers, grades) {

  let orderedNumbers = window.numbers.slice().sort((x,y) => x > y ? -1 : 1)

  let output = "";

  orderedNumbers.forEach((num) => {
    output += (num + "\t" + window.categoryDictGradeByNum[num] + "\n");
  })

  $('#output_ordered').val(output);
}





