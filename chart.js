const colors =             [//colorSet Array

    "#2F4F4F",
    "#008080",
    "#2E8B57",
    "#3CB371",
    "#90EE90"                
    ];

window.refreshChart = function () {

    let dataPoints = [];

    let i = 0;
    for(let key in categoryFreq) {
        dataPoints[i++] = {x: i, y: categoryFreq[key], label: key}
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
}