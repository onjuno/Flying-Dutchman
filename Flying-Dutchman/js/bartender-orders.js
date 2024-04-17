/*------------------------------------------Main functions------------------------------------------------*/
/*------------------------------------------Main functions------------------------------------------------*/
/*------------------------------------------Main functions------------------------------------------------*/

// Displays all orders (centrally in the main section)
function displayAllOrders() {
    var orders = getAllOrders();
    const orderListHTML = createOrderListHTML(orders);
    $('#main-section').html(orderListHTML);
}

// Displays all unpaid orders (centrally in the main section)
function displayUnpaidOrders() {
    var orders = getUnpaidOrders();
    const orderListHTML = createOrderListHTML(orders);
    $('#main-section').html(orderListHTML);
}

/*----------------------------------HTML Components Generator Functions-------------------------------------*/
/*----------------------------------HTML Components Generator Functions-------------------------------------*/
/*----------------------------------HTML Components Generator Functions-------------------------------------*/

// Returns an html list of orders
function createOrderListHTML(orders) {
    const listElements = orders.map(function(order) {
        return `
            <li id="order-${order.order_id}" class="order-item" onclick="toggleOrderDisplay(${order.order_id})">
                <div class="li-order-attributes">
                    <div class="li-order-attribute"><strong>Table Number:</strong> ${order.table_nr}</div>
                    <div class="li-order-attribute"><strong>Time:</strong> ${order.timestamp}</div>
                    <div class="li-order-attribute"><strong>Price:</strong> ${order.sum_price} SEK</div>
                    <div class="li-order-attribute"><strong>Paid:</strong> ${order.paid ? 'Yes' : 'No'}</div>
                </div>
            </li>
        `
    });

    const html = `
        <div id="main-section-content">
            <ul id="orders-list">${listElements.join('')}</ul>
            <div class="order-details"></div>
        </div>`

    return html;
}

// Returns the content for the container on the right side that is displayed when an order is selected
function createOrderDetailsHTML(orderId) {
    const order = getOrderById(orderId);
    const orderButtonsHtml = createOrderButtonsHTML(order);
    const drinkCardsHTML = createDrinkCardsHTML(order);

    var html = `
        <h2>Shopping Cart</h2>
        ${drinkCardsHTML}
        ${orderButtonsHtml}`;
    
    return html;
}

// Returns multiple cards (html divs) - each card contains information about one of the ordered drinks in
// The cards can be used for the order details component on the right side of the screen
function createDrinkCardsHTML(order) {
    const drinkList = aggregateStockWithInformationFromBeverageDB(order.drinks);
    const drinkCardsHTML = drinkList.map(function (drink) {
        const buttonHTML = `<button id="editPrice-${drink.article_id}" class="editPriceOfOrderedItemBtn" onclick="openPriceModificationPopUpHTML(${drink.article_id})">$</button>`
        const itemHTML = `
                        <div class="cartItem" data-id="${1}">
                            <div class="flex-container">
                            <p class="itemName">${drink.name}</p>
                            ${order.paid ? '' : buttonHTML}
                            </div>
                            <p class="itemPrice">${drink.amount} x ${drink.single_price} SEK</p>
                            <p class="itemQuantity">Note: ${drink.comment}</p>
                        </div>
                    `;
        return itemHTML;
    })

    const html = `
        <div class="drinks-grid">
            ${drinkCardsHTML.join('')}
        </div>`
  
    return html;
}

// Returns action buttons to edit, cancel or pay an order
function createOrderButtonsHTML(order) {
    if (!order.paid) {
        return `
            <div class="order-buttons">
                <button class="edit-order" onclick="editOrder(${order.order_id})">Edit Order</button>
                <button class="cancel-order" onclick="cancelOrder(${order.order_id})">Cancel Order</button>
                <button class="pay-order" onclick="payOrder(${order.order_id})">Pay Order</button>
            </div>`;
    } else {
        return ``;
    }
}

// Returns popup content to confirm the payment of an order
function createOrderPaymentPopUpHTML(orderId) {
    const popUpContent = `
        <div class="popup-content" id="popup-content-cancel-order">
            <span class="close" onclick="closeOrderPopup(${orderId})">&times;</span>
            <h2>Do you really want to set this order to paid?</h2>
            <div>If you choose to set the order to paid, it cannot be edited anymore</div>
            
            <button class="submit-action-btn" onclick="submitPayOrder(${orderId})">Yes, I am sure</button>
            <button class="cancel-action-btn" onclick="closeOrderPopup(${orderId})">No, I want to keep it</button>
        </div>
    `;
    return popUpContent;
}

// Returns popup content to confirm the cancelation of an order
function createOrderCancelPopUpHTML(orderId) {
    const popUpContent = `
        <div class="popup-content" id="popup-content-cancel-order">
            <span class="close" onclick="closeOrderPopup(${orderId})">&times;</span>
            <h2>Are you sure you want to cancel this order?</h2>
            <div>If you choose to cancel the order it will be removed from the system</div>
            
            <button class="submit-action-btn" onclick="submitCancelOrder(${orderId})">Yes, I am sure</button>
            <button class="cancel-action-btn" onclick="closeOrderPopup(${orderId})">No, I want to keep it</button>
        </div>
    `;
    return popUpContent;
}

// Returns popup content to modify the price of an ordered drink
function createPriceModificationPopUpHTML(beverage, orderedDrinkInfo) {
    const popUpContent = `
        <div class="popup-content" id="popup-content-edit-drink-in-stock">
            <div class="popup-header" articleid="${beverage.articleid}">
            <b class="popup-header-text">${beverage.name} (${beverage.articleid})</b>
            <span class="close" onclick="closeOrderPopup()">&times;</span>
            </div>
            <div class="popup-body">
            <div>
                <label for="drinkPrice">Price (SEK):</label>
                <br><input type="text" id="drinkPrice" value="${orderedDrinkInfo.single_price}">
            </div>
            <div>
                <label for="priceModificationReason">Reason:</label>
                <br><select id="priceModificationReason">
                    <option value="none" selected>None</option>
                    <option value="Mistake">Mistake</option>
                    <option value="Customer Compensation">Customer Compensation</option>
                    <option value="On the house">On the house</option>
                    <option value="Other reason">Other reason</option>
                </select></br>
            </div>
            </div>
            <button onclick="handlePriceModificationSubmission()" class="submit-btn">Submit</button>
        </div>
    `;
    return popUpContent;
}

/*------------------------------------------Helper functions------------------------------------------------*/
/*------------------------------------------Helper functions------------------------------------------------*/
/*------------------------------------------Helper functions------------------------------------------------*/

// Toggle active order display on the right side
function toggleOrderDisplay(orderId) {
    var orderListItem = $('#order-' + orderId);
    var sideContainer = $('#sideContainer');

    if (orderListItem.hasClass('active')) {
        orderListItem.removeClass('active');
        sideContainer.removeClass('active');
    } else {
        $('.order-item').removeClass('active');
        orderListItem.addClass('active');
        sideContainer.addClass('active');
    }

    const orderDetailsHTML = createOrderDetailsHTML(orderId);
    $('#sideContainer').html(orderDetailsHTML);
}

// Switch to the ordering/customer view to edit the order
function editOrder(orderId) {
    var url = "customer.html?orderId=" + orderId;
    window.location.href = url;
}

// Open popup to cancel order
function cancelOrder(orderId) {
    const popupContent = createOrderCancelPopUpHTML(orderId);
    document.getElementById('popup').style.display = 'flex';
    document.querySelector('#popup').innerHTML = popupContent;
}

// Open popup to pay order
function payOrder(orderId) {
    const popupContent = createOrderPaymentPopUpHTML(orderId);
    document.getElementById('popup').style.display = 'flex';
    document.querySelector('#popup').innerHTML = popupContent;
}

// Function that is called when the employee confirms to cancel an order
function submitCancelOrder(orderId) {
    deleteOrder(orderId);
    closeOrderPopup(orderId);
    $('#order-' + orderId).removeClass("active");
    $('#sideContainer').removeClass('active');
}

// Function that is called when the employee confirms that an order has been paid
function submitPayOrder(orderId) {
    const order = getOrderById(orderId);
    order.paid = true;
    updateOrder(order);
    closeOrderPopup(orderId);
    $('#order-' + orderId).removeClass("active");
    $('#sideContainer').removeClass('active');
}

// Function that is called when the popup is supposed to be closed
function closeOrderPopup(orderId) {
    document.getElementById('popup').style.display = 'none';
    sessionStorage.removeItem('orderAmounts');
    displayAllOrders(); // Not totally correct, could also be on the unpaid orders tab
    $('#order-' + orderId).addClass("active");
}  

// Open price modification pop-up
function openPriceModificationPopUpHTML(article_id) {
    var selectedOrderId = getActiveOrderId();
    var orderedDrinkInfo = getDrinkByOrderIdAndDrinkId(selectedOrderId, article_id);
    var beverage = getBeverageByArticleId(article_id);

    document.getElementById('popup').style.display = 'flex';
    document.querySelector('#popup').innerHTML = createPriceModificationPopUpHTML(beverage, orderedDrinkInfo);
}

// Function that is called when a price modification has been submitted/confirmed
function handlePriceModificationSubmission() {
    var selectedOrderId = getActiveOrderId();
    var article_id = $('.popup-header').attr('articleid');
    var drinkPrice = $('#drinkPrice').val();
    var priceModificationReason = $('#priceModificationReason').val();
    var modifiedOrderedDrink = {
        "article_id": article_id,
        "single_price": drinkPrice,
        "amount": getAmountOfOrderedDrink(selectedOrderId, article_id),
        "comment": priceModificationReason
    };
    updateDrinkInOrder(selectedOrderId, modifiedOrderedDrink);
    closeOrderPopup();
    displayAllOrders();
    $('#order-' + selectedOrderId).addClass("active");
    const orderDetailsHTML = createOrderDetailsHTML(selectedOrderId);
    $('#sideContainer').html(orderDetailsHTML);
}

// Get active order ID
function getActiveOrderId() {
    var activeOrderItem = $('.order-item.active');
    return activeOrderItem.length > 0 ? activeOrderItem.attr('id').split('-')[1] : null;
}