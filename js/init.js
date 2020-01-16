var app = {};
// window.app = app;

app.refreshSlider = (typeNames, handles) => {}; // gloabal variables in declared data.js
app.refreshRangesTable = undefined;
app.refreshChart = undefined;
app.categoryFreq = {};

window.onload = () => {
    // To prevent download and run code locally, trivial precauiton
    if(window.location.href.indexOf("hasan") < 0 && window.location.href.indexOf("grade-letter") < 0 && window.location.href.indexOf("localhost:3001") < 0) {
        $("body")[0].textContent = ""
    }
};

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

window.app = app;
