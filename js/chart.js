/**
 * @author Hasan Yilmaz <github.com/yilmazhasan>
 */

 app = window.app;

 var colors = [//colorSet Array
    "#2F4F4F",
    "#008080",
    "#2E8B57",
    "#3CB371",
    "#90EE90"                
    ];

    // “#4661EE”,
    // “#EC5657”,
    // “#1BCDD1”,
    // “#8FAABB”,
    // “#B08BEB”,
    // “#3EA0DD”,
    // “#F5A52A”,
    // “#23BFAA”,
    // “#FAA586”,
    // “#EB8CC6”,
    

app.refreshChart = function () {

    let dataPoints = [];

    let i = 0;
    for(let key in app.categoryFreq) {
        dataPoints[i++] = {x: i, y: app.categoryFreq[key], label: key}
    }

    CanvasJS.addColorSet("greenShades", colors);

    var chart = new CanvasJS.Chart("chartContainer",
    {
        colorSet: "greenShades",

        title:{
            text: "Grade frequencies"
        },
        data: [
        {        
            type: "column",
            dataPoints: dataPoints
        }
        ]
    });

    chart.render();
};