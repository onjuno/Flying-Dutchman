// Global variables to store history stacks
var undoStack = [];
var redoStack = [];

$(document).ready(function () {
    // Event listeners for undo and redo buttons
    $('#undoButton').click(undo);
    $('#redoButton').click(redo);
});

// Undo and redo functionality
function undo() {
    console.log("undo");
    if (undoStack.length > 0) {
        var prevState = undoStack.pop();
        var currentState = getTableData(prevState.tableName);
        updateTableData(prevState.tableName, prevState.tableState);
        rerenderPage();
        var redoItem = { tableName: prevState.tableName, tableState: deepCopy(currentState) };
        redoStack.push(redoItem);
        updateUndoRedoButtons();
    }
}

function redo() {
    if (redoStack.length > 0) {
        var nextState = redoStack.pop();
        var currentState = getTableData(nextState.tableName)
        updateTableData(nextState.tableName, nextState.tableState);
        rerenderPage();
        var undoItem = { tableName: nextState.tableName, tableState: deepCopy(currentState) };
        undoStack.push(undoItem);
        updateUndoRedoButtons();
    }
}

function updateUndoRedo(tableName, tableState) {
    var undoItem = { tableName: tableName, tableState: deepCopy(tableState) };
    undoStack.push(undoItem);
    redoStack = [];
    updateUndoRedoButtons();
}


function updateUndoRedoButtons() {
    if (undoStack.length === 0) {
        $('#undoButton').addClass('disabled');
        $('#undoButton').attr('src', 'images/Icons/undo-white.png');
    } else {
        $('#undoButton').removeClass('disabled');
        $('#undoButton').attr('src', 'images/Icons/undo-grey.png');
    }

    if (redoStack.length === 0) {
        $('#redoButton').addClass('disabled');
        $('#redoButton').attr('src', 'images/Icons/redo-white.png');
    } else {
        $('#redoButton').removeClass('disabled');
        $('#redoButton').attr('src', 'images/Icons/redo-grey.png');
    }
}


// Rerender the page with current settings
function rerenderPage() {
    if ($('#ordersTab').hasClass('selected')) {
        var selectedOrderId = getActiveOrderId();
        displayAllOrders();
        if (selectedOrderId != null) {
            $('#order-' + selectedOrderId).addClass("active");
            const orderDetailsHTML = createOrderDetailsHTML(selectedOrderId);
            $('#sideContainer').html(orderDetailsHTML);
        }
    } else if ($('#unpaidOrdersTab').hasClass('selected')) {
        displayUnpaidOrders()
    } else if ($('#stockTab').hasClass('selected')) {
        displayStockManagement()
    } else if ($('#menuTab').hasClass('selected')) {
        displayMenuManagement()
    } else {
        console.log("Error")
        displayAllOrders()
    }
}

// Own implementation of deepCopy (needed as otherwise the tableState pushed to the undo/redo stack is changed later in code and as it is stored as reference that would be a problem)
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj; // Return the original value if it's not an object
    }

    let copy = Array.isArray(obj) ? [] : {}; // Determine if the object is an array or not

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepCopy(obj[key]); // Recursively deep copy nested objects
        }
    }

    return copy;
}
