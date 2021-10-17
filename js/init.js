var app = {};
// window.app = app;

app.refreshSlider = (typeNames, handles) => {}; // gloabal variables in declared data.js
app.refreshRangesTable = undefined;
app.refreshChart = undefined;
app.categoryFreq = {};

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

window.app = app;
