const shoppingCart = new Map() // should consist of elements with articleId and quantity

$(document).ready(function () {
    $('#AllTab').addClass('selected');
    // 默认显示所有数据
    updateDisplay('all');
    initShoppingCart();
});

$("#nav li").click(function() {

    // 移除之前选定的标签上的 .selected 类
    $("#nav li").removeClass("selected");
    // 将当前点击的标签添加 .selected 类
    $(this).addClass("selected");

    var category = $(this).attr('id').replace('Tab', '').toLowerCase();
    var categoryFilter = '';

    switch (category) {
    case 'all':
        categoryFilter = 'all';
        break;
    case 'beers':
        categoryFilter = 'beer';
        break;
    case 'wines':
        categoryFilter = 'wine';
        break;
    case 'spirits':
        categoryFilter = 'spirit';
        break;
    case 'cocktails':
        categoryFilter = 'cocktail';
        break;
    }

    updateDisplay(categoryFilter);
});

$("#header-left").click(function() {
    location.href='index.html';
})

$('#orderButton').click(function () {
    var orderDrinks = Array.from(shoppingCart.entries()).map(([key, value]) => {
        var stockObj = getDrinkInStockById(key);
        var orderDrink = {
            "article_id": key,
            "single_price": stockObj.sale_price,
            "amount": value,
            "comment": "No modification"
        };
        return orderDrink;
    });    
    
    sessionStorage.removeItem('orderAmounts');
    document.getElementById("shoppingcart-items").innerHTML = ""
    shoppingCart.clear();

    // Use the orderId to fetch order details from the server or session storage
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    if (orderId) {
        const order = getOrderById(orderId);
        order.drinks = orderDrinks;
        updateOrder(order);
        window.location.href = 'bartender.html';
    } else {
        // tableNr random (1-10) only for demo purpose
        // TODO: It needs to be set somewhere before ordering
        var tableNr = Math.floor(Math.random() * 11); 
        createNewOrder(tableNr, orderDrinks);
    }
    
})

function initShoppingCart() {
    // Parse the URL to get the order ID
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    // Use the orderId to fetch order details from the server or session storage
    if (orderId) {
        const order = getOrderById(orderId);
        if (order) {
            order.drinks.forEach(orderDrink => {
                const stockDrink = getDrinkInStockById(orderDrink.article_id);
                for (let index = 0; index < orderDrink.amount; index++) {
                    addItemToCart(stockDrink.name, stockDrink.sale_price, orderDrink.article_id)
                }
            })
        }
    }
}


/*------------------------------Drag & drop---------------------------------*/
var totalPrice = 0;

function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    var id = event.target.id.replace('dragItem-', '');
    var name = event.target.querySelector('h4').textContent;
    var price = event.target.querySelector('p:last-of-type').textContent;
    var data = {id, name, price};
    event.dataTransfer.setData("text/plain", JSON.stringify(data));
}
function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text/plain");
    var {id, name, price} = JSON.parse(data);
    addItemToCart(name, price, id);
}


/*------------------------------Displayed drinks in shopping cart---------------------------------*/

function addItemToCart(name, price, id) {
    if (shoppingCart.has(id)) {
        // If the item already exists in the shopping cart, increment its quantity
        shoppingCart.set(id, shoppingCart.get(id) + 1);
        updateCartItemQuantity(id, shoppingCart.get(id));
    } else {
        // If the item doesn't exist in the shopping cart, add it with quantity 1
        shoppingCart.set(id, 1);
        var cartItems = document.getElementById("shoppingcart-items");
        
        var itemHTML = `
            <div class="cartItem" data-id="${id}">
                <div class="flex-container">
                    <p class="itemName">${name}</p>
                    <button onclick="removeCartItem('${id}')" class="removeItemBtn">Remove</button>
                </div>
                <p class="itemPrice">${price}</p>
                <p class="itemQuantity">Quantity: 1</p>
            </div>
        `;
        
        cartItems.innerHTML += itemHTML;
    }
    updateTotalAmount();
}

function updateCartItemQuantity(id, quantity) {
    var quantityElement = document.querySelector(`.cartItem[data-id="${id}"] .itemQuantity`);
    if (quantityElement) {
        quantityElement.textContent = `Quantity: ${quantity}`;
    }
}



function removeCartItem(id) {
    var quantity = shoppingCart.get(id);
    if (quantity > 1) {
        shoppingCart.set(id, quantity - 1);
        updateTotalAmount();
    } else {
        shoppingCart.delete(id);
        var itemToRemove = document.querySelector(`.cartItem[data-id="${id}"]`);
        if (itemToRemove) {
            itemToRemove.parentNode.removeChild(itemToRemove);
            updateTotalAmount();
        }
    }

}

//Adding by clicking
document.getElementById('beverage_database').addEventListener('click', function(event) {
    var item = event.target.closest('.item');
    if (item) {
        var id = item.id.replace('dragItem-', '');
        var name = item.querySelector('h4').textContent;
        var price = item.querySelector('p:last-of-type').textContent;
        addItemToCart(name, price, id);
    }
});

function updateTotalAmount() {
    var total = 0;
    document.querySelectorAll('.cartItem').forEach(function(item) {
        var priceText = item.querySelector('.itemPrice').textContent; // 获取价格文本
        var quantityText = item.querySelector('.itemQuantity').textContent; // 获取数量文本
        var price = parseFloat(priceText.replace('Price: SEK ', '').replace(':-', '')); // 转换为数字
        var quantity = parseInt(quantityText.replace('Quantity: ', ''));
        total += price * quantity; // 计算总价
    });
    document.querySelector('.total-amount h3').textContent = 'Total: SEK ' + total.toFixed(2) + ':-'; // 更新显示
}



/*------------------------------Displayed drinks in center---------------------------------*/

//Show the menu and the filter function
function createItemHTML(element, categoryType) {
    var typeLabel = '';
    var additionalInfo = '';

        switch (categoryType) {
        case 'beer':
            typeLabel = ' (Beer)';
            additionalInfo = '<p>Producer:' + element.producer +'</p>'+
                            '<p>Country:' + element.country +'</p>' +
                            '<p>Type:' + element.catgegory +'</p>'+                        
                            '<p>Strength:' + element.alcohol_percentage +'%</p>' ;
            break;
        case 'wine':
            typeLabel = ' (Wine)';
            additionalInfo = '<p>Year:' + element.introduced +'</p>' +
                            '<p>Producer:' + element.producer +'</p>'+
                            '<p>Type:' + element.catgegory +'</p>'+
                            '<p>Grape:' + element.grape +'</p>';//UNKNOWN                         
            break;
        case 'spirit':
            typeLabel = ' (Spirit)';
            additionalInfo = '<p>Strength:' + element.alcohol_percentage +'</p>'+
                            '<p>Contents:' + element.contents +'</p>';//UNKNOWN
                            
            break;
        case 'cocktail':
            typeLabel = ' (Cocktail)';
            additionalInfo = '<p>Strength:' + element.alcohol_percentage +'</p>'+
                            '<p>Contents:' + element.contents +'</p>';//UNKNOWN
                            
            break;
        }

    return '<div class="item ' + categoryType + 
            '" draggable="true" ondragstart="drag(event)" id="dragItem-' + element.article_id +'">' +
            '<h4>' + element.name + typeLabel + '</h4>' + 
            additionalInfo +
                                    
            '<p>Serving:' + element.packaging +'</p>' +
            '<p>Price: SEK ' + element.sale_price + ':-</p>' +     
            '</div>';
}

function updateDisplay(categoryFilter) {
    $("#beverage_database").empty();

    $.each(DB_STOCK, function(key, element) {
    
    if ((categoryFilter === 'beer' && element.beer) ||
        (categoryFilter === 'wine' && element.wine) ||
        (categoryFilter === 'spirit' && element.spirit) ||
        (categoryFilter === 'all')||
        (categoryFilter==='cocktail'&& element.cocktail)) {
        var categoryType = '';
        if ( element.beer) categoryType = 'beer';
        else if (element.wine) categoryType = 'wine';
        else if (element.spirit) categoryType = 'spirit';
        else if (element.cocktail) categoryType = 'cocktail';
        if(element.in_stock!=0){
        var content = createItemHTML(element, categoryType);
        $("#beverage_database").append(content);
        }              
    }
    });
}
// Function to reset the shopping cart
function resetShoppingCart() {
    var shoppingCartItems = document.getElementById("shoppingcart-items");
    if (shoppingCartItems) {
        shoppingCartItems.innerHTML = "";
    }

    var totalAmountDisplay = document.querySelector(".total-amount h3");
    if (totalAmountDisplay) {
        totalAmountDisplay.textContent = "";
    }
}

// Function to handle clicking the "Pay" button
function handlePayButtonClick() {
    var confirmation = confirm("Do you want to pay by your balance? If not, you'll pay at the bar.");
    if (confirmation) {
        // User wants to pay on the spot
        alert("You'll pay on the spot. Proceed with your purchase.");
        resetShoppingCart(); // Reset shopping cart
    } else {
        // User wants to pay at the bar
        alert("You'll pay at the bar. Proceed with your purchase.");
        resetShoppingCart(); // Reset shopping cart
    }
}

// Event listener for the "Pay" button
document.addEventListener("DOMContentLoaded", function() {
    var payButton = document.getElementById("payButton");
    if (payButton) {
        payButton.addEventListener("click", handlePayButtonClick);
    }
});
