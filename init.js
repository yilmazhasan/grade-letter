const app = {};
// window.app = app;

app.refreshSlider = (typeNames, handles) => {} // gloabal variables in declared data.js
app.refreshRangesTable = undefined;
app.refreshChart = undefined;
app.categoryFreq = {};

window.onload = () => {
    if(window.location.href.indexOf("hasan") < 0) {
        $("body")[0].textContent = ""
    }
}

