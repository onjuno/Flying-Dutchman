// Global variable to store tab history
var tabHistory = [];
var undoStack = [];
var redoStack = [];


$(document).ready(function () {
    // Event listeners for tab clicks
    $('#nav li').click(function () {
        var selectedTabId = $(this).attr('id');
        updateTabHistory(selectedTabId); // Update tab history when a tab is clicked
        rerenderPage(); // Rerender the page based on the selected tab
    });

    // Event listeners for undo and redo buttons
    $('#undoButton').click(undo);
    $('#redoButton').click(redo);
});

// Function to update tab history
function updateTabHistory(tabId) {
    tabHistory.push(tabId);
}

// Undo and redo functionality
function undo() {
    console.log("undo");
    if (undoStack.length > 0) {
        var prevState = undoStack.pop();
        // Restore previous state
        restoreState(prevState);
    } else if (tabHistory.length > 1) { // Check if there are tabs to undo
        var previousTab = tabHistory.pop(); // Get the previous tab
        $('#' + previousTab).trigger('click'); // Trigger click event on the previous tab
    }
}

function redo() {
    if (redoStack.length > 0) {
        var nextState = redoStack.pop();
        // Restore next state
        restoreState(nextState);
    } else if (tabHistory.length > 0) { // Check if there are tabs to redo
        var nextTab = tabHistory.shift(); // Get the next tab
        $('#' + nextTab).trigger('click'); // Trigger click event on the next tab
    }
}

// Function to restore state
function restoreState(state) {
    var currentState = getTableData(state.tableName);
    updateTableData(state.tableName, state.tableState);
    rerenderPage();
    // Update undo-redo stack
    var redoItem = { tableName: state.tableName, tableState: deepCopy(currentState) };
    redoStack.push(redoItem);
    updateUndoRedoButtons();
}
