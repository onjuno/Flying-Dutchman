$(document).ready(function () {
    // Initialize the UI based on session data
    initializeUI();

    // Event listener for tab clicks
    $("#nav li").click(function() {
        var tabId = $(this).attr('id');
        console.log(tabId)
        switchTab(tabId);
    });

    $("#header-left").click(function() {
        location.href='index.html';
    })

});

// Initialize UI elements
function initializeUI() {
    initDB();
    var loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
        $('#loggedInUser').text(loggedInUser);
    }
    $('#ordersTab').addClass('selected');
    displayAllOrders();
}

// Switch between tabs
function switchTab(tabId) {
    $("#nav li").removeClass("selected");
    $('.order-item').removeClass('active');
    $('#sideContainer').removeClass('active');
    $("#" + tabId).addClass('selected');
    switch (tabId) {
        case 'ordersTab':
            displayAllOrders();
            break;
        case 'unpaidOrdersTab':
            displayUnpaidOrders();
            break;
        case 'stockTab':
            initStockManagementDisplay();
            break;
    }
}
