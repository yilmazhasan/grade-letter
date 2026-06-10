/**
 * @author Hasan Yilmaz <github.com/yilmazhasan>
 */

app = window.app;

app.refreshSlider = function refreshSlider(typeNames, handles) {
  $("#slider").slider({
    min: 0,
    max: 100,
    step: 0.5,
    range: false,
    tooltips: true,
    handles: handles,
    showTypeNames: true,
    typeNames: typeNames,
    mainClass: "sleep",
    slide: function (e, ui) {
      // intentionally empty — refresh happens on mouseStop
    },
    handleActivated: function (event, handle) {
      var select = $(this).parent().find(".slider-controller select");
      select.val(handle.type);
    }
  });
};

app.refreshRangesTable = function refreshRangesTable() {
  if (!app.numbers) {
    return;
  }

  calculateCategoryFreqs(app.numbers);

  let rangesTableBody = $("#currentRanges")[0].children[1]; // 0: thead, 1: tbody

  while (rangesTableBody.childElementCount) {
    rangesTableBody.deleteRow(0);
  }

  // Fixed: comparator returns a number, not a boolean
  app.handles.sort((x, y) => x.value - y.value);

  for (let i = 0; i < app.handles.length; i++) {
    let tr = document.createElement("tr");
    let td_name = document.createElement("td");
    let td_val = document.createElement("td");
    let td_count = document.createElement("td");
    td_name.textContent = app.handles[i].type.toUpperCase();
    let from = app.handles[i].value;
    let to = app.handles[i + 1] ? app.handles[i + 1].value : 100;
    td_val.textContent = `[${from}–${to}]`;
    td_count.textContent =
      app.categoryFreq[app.handles[i].type.toUpperCase()] || 0;
    tr.appendChild(td_name);
    tr.appendChild(td_val);
    tr.appendChild(td_count);
    rangesTableBody.append(tr);
  }
};

function resizeTextAreas({ rowCount }) {
  rowCount = rowCount < 20 ? 20 : rowCount;
  $("#input").attr("rows", rowCount);
  $("#output").attr("rows", rowCount);
  $("#output_ordered").attr("rows", rowCount);
}

function input_changed() {
  let input = $("#input").val();
  input = input.replace(/\s+/g, "\n");
  $("#input").val(input);

  let inputArray = input.split("\n").filter((x) => x);
  resizeTextAreas({ rowCount: inputArray.length + 3 });

  let numbers = inputArray.map((x) => Number(x));
  app.inputGrades = app.numbers = numbers;
  app.sortedGrades = app.inputGrades.slice().sort((x, y) => (x > y ? 1 : -1));

  let errors = [];
  numbers.forEach((element, i) => {
    if (element != 0 && !element) {
      errors.push(inputArray[i]);
    }
  });

  if (errors.length) {
    app.notify("Invalid values (not numbers): " + errors.join(", "), "danger");
    return;
  }

  app.categoryDictGradeByNum = getCategories(numbers.slice());
  calculateStats();
  app.refreshOutput();
}

function updateOutput() {
  let categoriesOrderedAsEntered = getCategoriesOrderedAsEntered();

  document.getElementById("statsPanel").style.display = "";
  document.getElementById("median").textContent = Number(
    app.classAverage
  ).toPrecision(3);
  document.getElementById("medianLetter").textContent = app.letterOfMedian;

  writeToOutput(categoriesOrderedAsEntered);
  writeToOutputOrdered();
}

function getCategoriesOrderedAsEntered() {
  let categoriesOrderedAsEntered = [];
  for (let i = 0; i < app.inputGrades.length; i++) {
    categoriesOrderedAsEntered.push(
      app.categoryDictGradeByNum[app.inputGrades[i]]
    );
  }
  return categoriesOrderedAsEntered;
}

function output_changed($event) {
  // Output (original order) is read-only; changes are ignored
}

function output_ordered_changed($event) {
  let newValues = $event.target.value.trim().split("\n");
  let newLetters = [];
  let grades = [];

  newValues.forEach((value) => {
    let gradeAndLetter = value.split("\t").filter((x) => x);
    grades.push(Number(gradeAndLetter[0]));
    newLetters.push(gradeAndLetter[1].toUpperCase());
  });

  if (!app.areArraysEqual(app.inputGrades, grades)) {
    app.notify(
      "Do not change the grade numbers — only letter assignments can be edited.",
      "warning"
    );
    let categoriesOrderedAsEntered = getCategoriesOrderedAsEntered();
    writeToOutputOrdered(categoriesOrderedAsEntered);
    return;
  }

  for (let i = 0; i < newLetters.length; i++) {
    if (app.letterSet.indexOf(newLetters[i]) < 0) {
      app.notify(
        "Unknown letter '" +
          newLetters[i] +
          "'. Use one of: " +
          app.letterSet.join(", "),
        "warning"
      );
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
      let oldLetterIndex = app.letterSet.indexOf(
        app.categoryDictGradeByNum[grade].toUpperCase()
      );
      let newLetterIndex = app.letterSet.indexOf(newLetters[i].toUpperCase());
      didLettersDecrease.push(oldLetterIndex >= newLetterIndex);
    }
  }

  updateCategoryDictForNewLetters(
    grades,
    newLetters,
    changedLetterIndexes,
    didLettersDecrease
  );
  updateOutput();
  calculateCategoryFreqs(grades);
  app.refreshChart();
  app.refreshRangesTable();
}

function updateCategoryDictForNewLetters(
  grades,
  newLetters,
  changedLetterIndexes,
  didLettersDecrease
) {
  for (const i of Object.keys(changedLetterIndexes)) {
    // fixed: was undeclared `for (i in ...)`
    let index = changedLetterIndexes[i];
    let oldLetterOfChangedOne = app.categoryDictGradeByNum[grades[index]];
    let newLetter = newLetters[index];
    app.categoryDictGradeByNum[grades[index]] = newLetter;

    if (didLettersDecrease[i]) {
      let lowerSameCategory = app.inputGrades.filter(
        (x) =>
          x < grades[index] &&
          app.categoryDictGradeByNum[x] == oldLetterOfChangedOne
      );
      for (let grade of lowerSameCategory) {
        app.categoryDictGradeByNum[grade] = newLetter;
      }
    } else {
      let higherSameCategory = app.inputGrades.filter(
        (x) =>
          x > grades[index] &&
          app.categoryDictGradeByNum[x] == oldLetterOfChangedOne
      );
      for (let grade of higherSameCategory) {
        app.categoryDictGradeByNum[grade] = newLetter;
      }
    }
  }
}

// Adds a zero-start "NA" handle if none exists, so all grades are covered
function checkHandlesLowBorder() {
  let lowBorder = false;
  app.handlesWithZero = app.handles.slice();

  for (let handle of app.handles) {
    // fixed: was undeclared `for (handle of ...)`
    if (handle.value == 0) {
      lowBorder = true;
    }
  }

  if (!lowBorder) {
    app.handlesWithZero.push({ value: 0, type: "NA" });
  }

  app.handlesWithZero.sort((x, y) => (x.value > y.value ? 1 : -1));
}

// Returns a dictionary mapping grade → letter
function getCategories(numbers) {
  checkHandlesLowBorder();

  numbers.sort((x, y) => (x > y ? 1 : -1));

  let totalCount = numbers.length;
  let categoryCounts = [];

  for (let i = 0; i < app.handlesWithZero.length; i++) {
    categoryCounts.push({
      category: app.handlesWithZero[i].type,
      count: Math.round(
        (totalCount *
          (((app.handlesWithZero[i + 1] || {}).value || 100) -
            app.handlesWithZero[i].value)) /
          100.0
      )
    });
  }

  let numOfUncategorizeds =
    totalCount - categoryCounts.reduce((sum, el) => sum + el.count, 0);

  fineTune(categoryCounts, numbers, numOfUncategorizeds);

  let categorizeds = [];
  let categoryCursor = 0;
  let numOfCategorized = 0;

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

    categorizeds.push({
      number: numbers[i],
      category: app.handlesWithZero[categoryCursor].type.toUpperCase()
    });
    numOfCategorized++;
  }

  app.categoryDictGradeByNum = {};

  for (let key in app.categoryFreq) {
    // fixed: was undeclared `for (key in ...)`
    app.categoryFreq[key] = 0;
  }

  categorizeds.forEach((el) => {
    if (!app.categoryDictGradeByNum[el.number]) {
      app.categoryDictGradeByNum[el.number] = el.category;
    }
  });

  app.refreshRangesTable();

  return app.categoryDictGradeByNum;
}

function calculateCategoryFreqs(grades, desc = true) {
  let sortedGrades;
  if (desc) {
    sortedGrades = grades.slice().sort((x, y) => (x > y ? -1 : 1));
  } else {
    sortedGrades = grades.slice().sort((x, y) => (x > y ? 1 : -1));
  }

  app.categoryFreq = {};
  sortedGrades.forEach((grade) => {
    let letter = app.categoryDictGradeByNum[grade];
    app.categoryFreq[letter] = (app.categoryFreq[letter] || 0) + 1;
  });
}

app.refreshOutput = () => {
  app.refreshSlider(app.typeNames, app.handles);
  app.refreshRangesTable();
  app.refreshChart();
  updateOutput();
};

function equalizeLetters() {
  let ignoreRange = Number($("#ignoreRange").val());

  let grades = Object.keys(app.categoryDictGradeByNum)
    .map((x) => Number(x))
    .sort((x, y) => (x > y ? 1 : -1));
  for (let i = 1; i < grades.length; i++) {
    if (Math.abs(grades[i] - grades[i - 1]) <= ignoreRange) {
      if (
        app.categoryDictGradeByNum[grades[i]] !=
        app.categoryDictGradeByNum[grades[i - 1]]
      ) {
        app.categoryDictGradeByNum[grades[i - 1]] =
          app.categoryDictGradeByNum[grades[i]];
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
    return;
  }

  if (numOfUncategorizeds < 0) {
    let cursor = 0;
    while (numOfUncategorizeds < 0) {
      if (categoryCounts[cursor] && categoryCounts[cursor].count) {
        categoryCounts[cursor].count--; // fixed: was cursor++ which decremented the wrong element
        numOfUncategorizeds++;
      }
      cursor = (cursor + 1) % categoryCounts.length;
    }
  }

  fineTuneIfSameNumWithDifferentCategory(
    categoryCounts,
    numbers,
    numOfUncategorizeds
  );

  if (numOfUncategorizeds > 0) {
    fineTuneExpandMiddleCategory(categoryCounts, numbers, numOfUncategorizeds);
  }

  function fineTuneIfSameNumWithDifferentCategory(
    categoryCounts,
    numbers,
    numOfUncategorizeds
  ) {
    let cursor = numbers.length - 1;
    for (let i = categoryCounts.length - 1; i >= 0; i--) {
      cursor -= categoryCounts[i].count;
      if (cursor < 0) return;

      if (numbers[cursor] == numbers[cursor + 1]) {
        let prevIndex = i - 1;
        while (categoryCounts[prevIndex] && !categoryCounts[prevIndex].count) {
          if (prevIndex <= 0) return;
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

  function fineTuneExpandMiddleCategory(
    categoryCounts,
    numbers,
    numOfUncategorizeds
  ) {
    if (numOfUncategorizeds <= 0) return;

    let middle = Math.round(categoryCounts.length / 2);
    while (!categoryCounts[middle]) {
      middle--;
      if (middle < 0) return;
    }

    categoryCounts[middle].count++;
    fineTuneExpandMiddleCategory(
      categoryCounts,
      numbers,
      --numOfUncategorizeds
    );
  }

  function fineTuneIfUncategorizedExists(
    categoryCounts,
    numbers,
    numOfUncategorizeds
  ) {
    let missingCategories = categoryCounts.filter((x) => x.count == 0);
    let missingCategoryWithHighestNum =
      missingCategories[missingCategories.length - 1];

    if (missingCategoryWithHighestNum) {
      missingCategoryWithHighestNum.count++;
      fineTune(categoryCounts, numbers, --numOfUncategorizeds);
    }
  }
}

function writeToOutput(outputArray) {
  $("#output").val(outputArray.join("\n"));
}

function writeToOutputOrdered() {
  let orderedNumbers = app.numbers.slice().sort((x, y) => (x > y ? -1 : 1));
  let output = "";
  orderedNumbers.forEach((num) => {
    output += num + "\t" + app.categoryDictGradeByNum[num] + "\n";
  });
  $("#output_ordered").val(output);
}

function showSampleGrades() {
  $("#input").val(app.sampleGrades.join("\n"));
  setTimeout(() => {
    app.notify(
      "Sample grades loaded — click Re-calculate or change the grades box.",
      "success"
    );
    input_changed();
  }, 100);
}

function showHelp() {
  $("#helpModal").modal("show");
}

function calculateStats() {
  // Compute arithmetic mean (average)
  app.sum = app.numbers.reduce((sum, x) => sum + x, 0); // fixed: added initial value 0
  app.classAverage = app.sum / app.numbers.length;

  // Find the letter for the class average using nearest-grade lookup
  if (app.categoryDictGradeByNum[app.classAverage]) {
    app.letterOfMedian = app.categoryDictGradeByNum[app.classAverage];
  } else {
    app.lowerNearestToMedian = app.sortedGrades[0];
    app.upperNearestToMedian = app.sortedGrades[app.sortedGrades.length - 1];

    for (let i = 0; i < app.numbers.length; i++) {
      let diff = app.numbers[i] - app.classAverage;
      if (diff > 0) {
        if (Math.abs(diff) < app.upperNearestToMedian - app.classAverage) {
          app.upperNearestToMedian = app.numbers[i];
        }
      } else {
        if (Math.abs(diff) < app.classAverage - app.lowerNearestToMedian) {
          app.lowerNearestToMedian = app.numbers[i];
        }
      }
    }

    if (app.categoryDictGradeByNum[app.lowerNearestToMedian]) {
      app.letterOfMedian = app.categoryDictGradeByNum[app.lowerNearestToMedian];
    } else if (app.categoryDictGradeByNum[app.upperNearestToMedian]) {
      app.letterOfMedian = app.categoryDictGradeByNum[app.upperNearestToMedian];
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
