app = window.app;

let typeNames = {
    'aa': 'AA',
    'ba': 'BA',
    'bb': 'BB',
    'cb': 'CB',
    'cc': 'CC',
    'dc': 'DC',
    'dd': 'DD',
    'fd': 'FD',
    'ff': 'FF',
    'na': 'NA',
  };

let handles = [{
    value: 2,
    type: "ff"
  }, {
    value: 7,
    type: "fd"
  }, {
    value: 16,
    type: "dd"
  }, {
    value: 31,
    type: "dc"
  }, {
    value: 50,
    type: "cc"
  }, {
    value: 69,
    type: "cb"
  }, {
    value: 84,
    type: "bb"
  }, {
    value: 93,
    type: "ba"
  }, {
    value: 98,
    type: "aa"
  }
];

app.typeNames = typeNames;
app.handles = handles;

app.letterSet = app.handles.map(x=> x.type.toUpperCase());


app.sampleGrades = [12, 25, 66, 98, 2, 15, 65, 85, 12, 23, 36, 65, 78, 44, 45, 48, 79, 43, 99];