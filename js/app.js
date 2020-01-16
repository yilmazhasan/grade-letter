/**
 * @author Hasan Yilmaz <github.com/yilmazhasan>
 */

app = window.app;

app.refreshSlider = function refreshSlider(typeNames, handles) {
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
    slide: function (e, ui) {
      console.log(e, ui);
    },
    // handle clicked callback
    handleActivated: function (event, handle) {
      // get select element
      var select = $(this).parent().find('.slider-controller select');
      // set selected option
      select.val(handle.type);
    }

  });

}

app.refreshRangesTable = function refreshRangesTable() {

  if(!app.numbers) {
    return;
  }
  
  calculateCategoryFreqs(app.numbers);

  let rangesTableBody = $('#currentRanges')[0].children[1]; // 0 is thead, 1 is tbody

  while (rangesTableBody.childElementCount) {
    rangesTableBody.deleteRow(0);  // first child is thead
  }

  // rangesTableBody.empty();

  app.handles.sort((x, y) => x.value < y.value);

  for (let i = 0; i < app.handles.length; i++) {
    let tr = document.createElement("tr");
    let td_name = document.createElement("td");
    let td_val = document.createElement("td");
    let td_count = document.createElement("td");
    td_name.textContent = app.handles[i].type;
    let from = app.handles[i].value;
    let to = app.handles[i + 1] ? app.handles[i + 1].value : '100'; // if undefined then it's last element
    td_val.textContent = `[${from}-${to}] : ${(to - from)}%`;
    td_count.textContent = app.categoryFreq[app.handles[i].type.toUpperCase()] || 0;
    tr.appendChild(td_name);
    tr.appendChild(td_val);
    tr.appendChild(td_count);
    rangesTableBody.append(tr); // .appendChild(tr);
  }

}

function resizeTextAreas({ rowCount }) {
  rowCount = rowCount < 25 ? 25 : rowCount;
  $('#input').attr("rows", rowCount);
  $('#output').attr("rows", rowCount);
  $('#output_ordered').attr("rows", rowCount);
}

function input_changed() {
  let input = $('#input').val()
  input = input.replace(/\s+/g, "\n");
  $('#input').val(input)
  
  let inputArray = input.split("\n").filter(x => x);
  resizeTextAreas({ rowCount: inputArray.length + 3 });

  let numbers = inputArray.map(x => Number(x))
  app.inputGrades = app.numbers = numbers;
  app.sortedGrades = app.inputGrades.slice().sort((x,y) => x > y ? 1 : -1);
  let errors = [];
  let num = 0;

  numbers.forEach((element, i) => {
    num = Number(element);
    if (num != 0 && !num) {
      errors.push(inputArray[i]);
    }
  })

  if (errors.length) {
    alert("There are some errors: \n" + errors.join(","))
    return;
  }

  app.categoryDictGradeByNum = getCategories(numbers.slice());
  calculateStats();
  app.refreshOutput();
}

function updateOutput() {
  let categoriesOrderedAsEntered = getCategoriesOrderedAsEntered();

  $("#medianLabel").css({display: 'inline'});
  $("#median").css({display: 'inline'});
  $("#medianLetter").css({display: 'inline'});
  $("#median").text(Number(app.median).toPrecision(3));
  $("#medianLetter").text(app.letterOfMedian);

  writeToOutput(categoriesOrderedAsEntered);
  writeToOutputOrdered(categoriesOrderedAsEntered);
}

function getCategoriesOrderedAsEntered() {
  let categoriesOrderedAsEntered = [];

  for (let i = 0; i < app.inputGrades.length; i++) {
    categoriesOrderedAsEntered.push(app.categoryDictGradeByNum[app.inputGrades[i]]);
  }

  return categoriesOrderedAsEntered;
}

function output_changed($event) {
  console.log("changing output will not affect")
}

function output_ordered_changed($event) {
  let newValues = $event.target.value.trim().split("\n");
  let newLetters = []
  let grades = []

  newValues.forEach((value) => {
    let gradeAndLetter = value.split("\t").filter(x => x);
    grades.push(Number(gradeAndLetter[0]))
    newLetters.push(gradeAndLetter[1].toUpperCase())
  })

  // Do not allow user to change grades
  if (!app.areArraysEqual(app.inputGrades, grades)) {
    alert("Please do not change grades in letter box! Re-try to change");
    let categoriesOrderedAsEntered = getCategoriesOrderedAsEntered();
    writeToOutputOrdered(categoriesOrderedAsEntered);
    return;
  }

  // Do not allow user to write a letter that does not exist in handles 
  for (let i = 0; i < newLetters.length; i++) {
    if (app.letterSet.indexOf(newLetters[i]) < 0) {
      alert("Please do not write letter different than availables! Re-try to change");
      let categoriesOrderedAsEntered = getCategoriesOrderedAsEntered();
      writeToOutputOrdered(categoriesOrderedAsEntered);
      return;

    }
  }

  let changedLetterIndexes = [];
  let didLettersDecrease = [];

  for (let i = 0; i < grades.length; i++) {
    let grade = grades[i];
    if (app.categoryDictGradeByNum[grade] != newLetters[i]) {
      changedLetterIndexes.push(i);
      let oldLetterIndex = app.letterSet.indexOf(app.categoryDictGradeByNum[grade].toUpperCase());
      let newLetterIndex = app.letterSet.indexOf(newLetters[i].toUpperCase());
      if (oldLetterIndex < newLetterIndex) // since handles are sorted as asc
      {
        didLettersDecrease.push(false)
      } else {
        didLettersDecrease.push(true)
      }
    }
  }

  updateCategoryDictForNewLetters(grades, newLetters, changedLetterIndexes, didLettersDecrease)
  updateOutput()
  calculateCategoryFreqs(grades);
  app.refreshChart()
  app.refreshRangesTable()
}

function updateCategoryDictForNewLetters(grades, newLetters, changedLetterIndexes, didLettersDecrease) {
  for (i in changedLetterIndexes) {
    let index = changedLetterIndexes[i];
    let oldLetterOfChangedOne = app.categoryDictGradeByNum[grades[index]];
    let newLetter = newLetters[index];
    app.categoryDictGradeByNum[grades[index]] = newLetter;

    if (didLettersDecrease[i]) {
      let indexesOfLowerThanGradeOfAndSameWithChangedLetter = app.inputGrades.filter(x => x < grades[index] && app.categoryDictGradeByNum[x] == oldLetterOfChangedOne)
      for (let grade of indexesOfLowerThanGradeOfAndSameWithChangedLetter) {
        app.categoryDictGradeByNum[grade] = newLetter;
      }

    } else {
      let indexesOfHigherThanGradeOfAndSameWithChangedLetter = app.inputGrades.filter(x => x > grades[index] && app.categoryDictGradeByNum[x] == oldLetterOfChangedOne)
      for (let grade of indexesOfHigherThanGradeOfAndSameWithChangedLetter) {
        app.categoryDictGradeByNum[grade] = newLetter;
      }

    }

  }

}

// if there are no type starting from zero, then add a NA grade that starts from zero
function checkHandlesLowBorder() {
  let lowBorder = false;
  let highBorder = false;

  app.handlesWithZero = app.handles.slice()  // different because we do not want to show zero on slider

  for (handle of app.handles) {
    if (handle.value == 0) {
      lowBorder = true;
    }
  }

  if (!lowBorder) {
    app.handlesWithZero.push({ value: 0, type: "NA" })
    console.log("low border added as NA");
  }

  app.handlesWithZero.sort((x, y) => x.value > y.value ? 1 : -1)
}

// Returns a dictonary that includes categories by num
function getCategories(numbers) {

  checkHandlesLowBorder()

  numbers.sort((x, y) => x > y ? 1 : -1);

  let totalCount = numbers.length;

  let categoryCounts = [];

  // let descendingSortedHandles = handles.slice().sort((x,y) => x.value > y.value ? -1 : 1)

  for (let i = 0; i < app.handlesWithZero.length; i++) {
    categoryCounts.push({
      category: app.handlesWithZero[i].type,
      count: Math.round(totalCount * (((app.handlesWithZero[i + 1] || {}).value || 100) - app.handlesWithZero[i].value) / 100.0)
    });
  }

  let numOfUncategorizeds = totalCount - categoryCounts.reduce((sum, el) => sum + el.count, 0);

  fineTune(categoryCounts, numbers, numOfUncategorizeds)
  let categorizeds = [];

  let categoryCursor = 0
  let numOfCategorized = 0

  for (let i = 0; i < totalCount; i++) {
    if (categoryCounts[categoryCursor].count == numOfCategorized) {
      categoryCursor++;
      numOfCategorized = 0;
      i--;
      continue;
    }

    if (!app.handlesWithZero[categoryCursor]) {
      numOfUncategorizeds = totalCount - i;
      break;
    }

    categorizeds.push({ number: numbers[i], category: app.handlesWithZero[categoryCursor].type.toUpperCase() });

    numOfCategorized++;
  }

  console.log(categorizeds);

  app.categoryDictGradeByNum = {};

  for (key in app.categoryFreq) {
    app.categoryFreq[key] = 0;
  }

  categorizeds.forEach(el => {
    if (!app.categoryDictGradeByNum[el.number]) {
      app.categoryDictGradeByNum[el.number] = el.category;
    }
  })

  app.refreshRangesTable();

  return app.categoryDictGradeByNum;
}

function calculateCategoryFreqs(grades, desc = true) {
  let sortedGrades;

  if (desc) {
    sortedGrades = grades.slice().sort((x, y) => x > y ? -1 : 1)
  } else {
    sortedGrades = grades.slice().sort((x, y) => x > y ? 1 : -1)
  }

  app.categoryFreq = {};

  sortedGrades.forEach(grade => {
    app.categoryFreq[app.categoryDictGradeByNum[grade]] = (app.categoryFreq[app.categoryDictGradeByNum[grade]] || 0) + 1;
  })
}

app.refreshOutput = () => {
  app.refreshSlider(app.typeNames, app.handles) // gloabal variables in declared data.js
  app.refreshRangesTable();
  app.refreshChart();
  updateOutput();
  // input_changed();
}

function equalizeLetters() {

  let ignoreRange = Number($("#ignoreRange").val());

  let grades = Object.keys(app.categoryDictGradeByNum).map(x=>Number(x)).sort((x,y) => x > y ? 1 : -1);
  for(let i = 1; i < grades.length; i++) {
    if(Math.abs(grades[i] - grades[i-1]) <= ignoreRange) {
      if(app.categoryDictGradeByNum[grades[i]] != app.categoryDictGradeByNum[grades[i-1]]) {
        app.categoryDictGradeByNum[grades[i-1]] = app.categoryDictGradeByNum[grades[i]];
      }
    }
  }


  updateOutput();
  app.refreshRangesTable();
  app.refreshChart();
}

function fineTune(categoryCounts, numbers, numOfUncategorizeds) {

  if (numOfUncategorizeds > 0) {
    fineTuneIfUncategorizedExists(categoryCounts, numbers, numOfUncategorizeds);
    return; // since function above will call this function recursively again
  }

  // if categorizeds are more than required, then just decrement starting from lowest grade
  if (numOfUncategorizeds < 0) {
    let cursor = 0;
    while (numOfUncategorizeds < 0) {
      if (categoryCounts[cursor] && categoryCounts[cursor++].count) {
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

  if (numOfUncategorizeds > 0) {
    fineTuneExpandMiddleCategory(categoryCounts, numbers, numOfUncategorizeds);
  }

  function fineTuneIfSameNumWithDifferentCategory(categoryCounts, numbers, numOfUncategorizeds) {

    let cursor = numbers.length - 1;  // start from last
    for (let i = categoryCounts.length - 1; i >= 0; i--) {
      cursor -= categoryCounts[i].count;
      if (cursor < 0) {
        return;
      }
  
      if (numbers[cursor] == numbers[cursor + 1]) {  // here is the diff point, below is low up is high category but same nums
        let prevIndex = i - 1;
        while (categoryCounts[prevIndex] && !categoryCounts[prevIndex].count) {
          if (prevIndex <= 0) {
            return;
          }
          prevIndex--;
        }
  
        if (categoryCounts[prevIndex]) {
          categoryCounts[i].count++;
          categoryCounts[prevIndex].count--;
          fineTune(categoryCounts, numbers, numOfUncategorizeds);
          return;
        }
      }
    }
  
  }
  
  function fineTuneExpandMiddleCategory(categoryCounts, numbers, numOfUncategorizeds) {
    if (numOfUncategorizeds <= 0) {
      console.log("Fine tune complete!");
      return; // finished
    }
  
    // If there are no uncategorized and same number with different category then increment one of biggest fraction or just middle
    let middle = Math.round(categoryCounts.length / 2);
  
    while (!categoryCounts[middle]) {
      middle--;
  
      if (middle < 0) {
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
    let missingCategoryWithHighestNum = missingCategories[missingCategories.length - 1]; // will return the highest category first
  
    if (missingCategoryWithHighestNum) {
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
  
}

function writeToOutput(outputArray) {
  $('#output').val(outputArray.join("\n"));
}

function writeToOutputOrdered() {

  let orderedNumbers = app.numbers.slice().sort((x, y) => x > y ? -1 : 1)

  let output = "";

  orderedNumbers.forEach((num) => {
    output += (num + "\t" + app.categoryDictGradeByNum[num] + "\n");
  })

  $('#output_ordered').val(output);
}

function showSampleGrades() {
  $("#input").val(app.sampleGrades.join("\n"));
  setTimeout(() => {    
    alert("Pasted to text area!");
    input_changed();
  }, 100);
}

function showHelp() {
  alert( `
  1. Add any letter category with its name and % of start value (It will ve considered as starting from value entered up to value of next)
  2. Or remove any unwanted one
  3. Paste all grades and see results
  4. Change any grade letter to one low or high (if you make one low by one step letter, then all grades lower than that grades up to lower letter bound will also decrease)
  5. Equalize letters: in a range diff; make all letters equal
  `)
}

function calculateStats() {
    app.sum = app.numbers.reduce((sum, x) => sum+= x);
    app.median = app.sum / app.numbers.length;
    
    // if there is a letter of median exists
    if(app.categoryDictGradeByNum[app.median]) {
        app.letterOfMedian = app.categoryDictGradeByNum[app.median];
    } else {
        app.lowerNearestToMedian = app.sortedGrades[0];
        app.upperNearestToMedian = app.sortedGrades[app.sortedGrades.length-1];
        for(let i = 0; i < app.numbers.length; i++) {
            let diff = app.numbers[i] - app.median;
            if(diff > 0) {  // then it is upper of median
                if(Math.abs(diff) < app.upperNearestToMedian - app.median) {
                    app.upperNearestToMedian = app.numbers[i];
                }
            } else {
                    if(Math.abs(diff) < app.median - app.lowerNearestToMedian) {
                        app.lowerNearestToMedian = app.numbers[i];
                    }
            }
        }

        if(app.categoryDictGradeByNum[app.lowerNearestToMedian]) {
            app.letterOfMedian = app.categoryDictGradeByNum[app.lowerNearestToMedian]; 
        } else if (app.categoryDictGradeByNum[app.upperNearestToMedian] && app.letterOfMedian != app.categoryDictGradeByNum[app.upperNearestToMedian]) {
            app.letterOfMedian = " - " + app.categoryDictGradeByNum[app.upperNearestToMedian];
        }

    }
}

app.resizeTextAreas = resizeTextAreas;
app.input_changed = input_changed;
app.updateOutput = updateOutput;
app.getCategoriesOrderedAsEntered = getCategoriesOrderedAsEntered;
app.output_changed = output_changed;
app.output_ordered_changed = output_ordered_changed;
app.updateCategoryDictForNewLetters = updateCategoryDictForNewLetters;
app.checkHandlesLowBorder = checkHandlesLowBorder;
app.getCategories = getCategories;
app.calculateCategoryFreqs = calculateCategoryFreqs;
app.equalizeLetters = equalizeLetters;
app.fineTune = fineTune;
app.writeToOutput = writeToOutput;
app.writeToOutputOrdered = writeToOutputOrdered;
app.showSampleGrades = showSampleGrades;
app.showHelp = showHelp;
app.calculateStats = calculateStats;