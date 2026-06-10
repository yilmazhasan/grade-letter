/**
 * @author Hasan Yilmaz <github.com/yilmazhasan>
 */

app = window.app;

app.areArraysEqual = function (array1, array2) {
    if (array1.length !== array2.length) return false;

    let array1Sorted = array1.slice().sort((x, y) => x > y ? 1 : -1);
    let array2Sorted = array2.slice().sort((x, y) => x > y ? 1 : -1);

    for (let i = 0; i < array1Sorted.length; i++) {
        if (array1Sorted[i] != array2Sorted[i]) {
            return false;
        }
    }

    return true;
};

// Inline notification replacing alert() dialogs.
// type: 'success' | 'info' | 'warning' | 'danger'
app.notify = function (message, type) {
    type = type || 'info';
    let bar = document.getElementById('notification-bar');
    if (!bar) return;
    bar.className = 'notification-bar alert alert-' + type;
    bar.textContent = message;
    bar.style.display = 'block';
    clearTimeout(app._notifyTimer);
    // Auto-hide after 4 s; click also hides it
    app._notifyTimer = setTimeout(function () {
        bar.style.display = 'none';
    }, 4000);
    bar.onclick = function () { bar.style.display = 'none'; };
};
