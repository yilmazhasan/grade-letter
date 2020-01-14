/**
 * @author Hasan Yilmaz <github.com/yilmazhasan>
 */

 app.areArraysEqual = function (array1, array2) {

    let array1Sorted = array1.slice().sort((x,y) => x > y ? 1 : -1);
    let array2Sorted = array2.slice().sort((x,y) => x > y ? 1 : -1);

    for(let i = 0; i < array1Sorted.length; i++) {
        if(array1Sorted[i] != array2Sorted[i]) {
            return false;
        }
    }

    return true;
}