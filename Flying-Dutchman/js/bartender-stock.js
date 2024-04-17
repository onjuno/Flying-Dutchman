/*------------------------------------------Main functions------------------------------------------------*/
/*------------------------------------------Main functions------------------------------------------------*/
/*------------------------------------------Main functions------------------------------------------------*/

// HTML template for filter section
const filterSectionHTML = `
    <div id="main-section-filter">
        <button id="addDrinkButton" onclick="openAddDrinkToStockPopUp()">+</button>
        <input type="text" id="searchDrinkInput" placeholder="Search..." oninput="displayStockManagement()">
        <label><input type="checkbox" id="lowStockCheckbox" onchange="displayStockManagement()"> Low in Stock</label>
        <label><input type="checkbox" id="outOfStockCheckbox" onchange="displayStockManagement()"> Out of Stock</label>
    </div>
    <div id="main-section-content"></div>
`;

// Init the stock view containing filter section and the drinks in stock listed as cards
function initStockManagementDisplay() {
    $('#main-section').html(filterSectionHTML); // Display filter section
    displayStockManagement();
}

// Function to filter and display stock based on values in the filter section
function displayStockManagement() {
    const filteredStock = filterStock();
    const aggregatedStockDrinks = aggregateStockWithInformationFromBeverageDB(filteredStock);
    const html = aggregatedStockDrinks.map(createStockDrinkCardHTML).join('');
    $('#main-section-content').html(html);
}

// Function to set up event listeners for user interactions
$(document).ready(function () {
    sessionStorage.removeItem('orderAmounts'); // Reset orderAmounts

    // Close dropdown on click outside
    window.onclick = function(event) {
        if (!event.target.matches('.stock-edit-btn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.style.display == 'block') {
                    openDropdown.style.display = 'none';
                }
            }
        }
    };
});

/*----------------------------------HTML Components Generator Functions-------------------------------------*/
/*----------------------------------HTML Components Generator Functions-------------------------------------*/
/*----------------------------------HTML Components Generator Functions-------------------------------------*/


// Create item HTML for both Stock and Menu views
function createStockDrinkCardHTML(aggregatedDrink) {
    var category = determineType(aggregatedDrink);
    var typeLabel = determineTypeLabel(category);

    var additionalInfo = createAdditionalDrinkInfoHTML(category, aggregatedDrink);
    var menuButton = createCardFooterHTML(aggregatedDrink);
    var dropDown = createCardDropdownHTML(aggregatedDrink);
    console.log(aggregatedDrink)

    var html = `
        <div class="item ${category}">
            <div class="stock-card-header">
                <b class="stock-card-header-text">${aggregatedDrink.name}${typeLabel}</b>
                ${dropDown}
            </div>
            <div class="additional-info">
                <!--${additionalInfo}-->
                <p>Price: ${aggregatedDrink.sale_price} SEK</p>
                <p>In Stock: ${aggregatedDrink.in_stock}</p>
            </div>
            ${menuButton}
        </div>
    `;

    return html;
}

// Function to create HTML for additional drink information based on category
function createAdditionalDrinkInfoHTML(category, aggregatedDrink) {
    switch (category) {
        case 'beer':
            return `<p>Producer: ${aggregatedDrink.producer}</p>
                    <p>Country: ${aggregatedDrink.countryoforiginlandname}</p>
                    <p>Type: ${aggregatedDrink.catgegory}</p>
                    <p>Strength: ${aggregatedDrink.alcoholstrength}</p>`;
        case 'wine':
            return `<p>Year: ${aggregatedDrink.introduced}</p>
                    <p>Producer: ${aggregatedDrink.producer}</p>
                    <p>Type: ${aggregatedDrink.catgegory}</p>
                    <p>Grape: ${aggregatedDrink.grape}</p>`;
        case 'cocktail':
            return `<p>Strength: ${aggregatedDrink.alcoholstrength}</p>
                    <p>Contents: ${aggregatedDrink.contents}</p>`;
        case 'spirit':
            return `<p>Producer: ${aggregatedDrink.producer}</p>
                    <p>Country: ${aggregatedDrink.countryoforiginlandname}</p>
                    <p>Type: ${aggregatedDrink.catgegory}</p>
                    <p>Strength: ${aggregatedDrink.alcoholstrength}</p>`;
        default:
            return '';
    }
}

// Function to create HTML for the dropdown menu in a drink card
function createCardDropdownHTML(aggregatedDrink) {
    return `
        <div class="stock-edit-dropdown">
            <button class="stock-edit-btn" onclick="toggleDropdown(${aggregatedDrink.articleid})">...</button>
            <div class="dropdown-content" id="dropdown-content-${aggregatedDrink.articleid}">
                <a href="#" onclick="editDrinkInStock(${aggregatedDrink.articleid})">Edit</a>
                <a href="#" onclick="deleteDrinkFromStock(${aggregatedDrink.articleid})">Delete</a>
            </div>
        </div>
    `;
}

// Function to create HTML for editing a drink in popup
function createEditDrinkInStockPopUp(beverage, drinkInStock) {
    const popUpContent = `
        <div class="popup-content" id="popup-content-edit-drink-in-stock">
          <div class="popup-header" articleid="${beverage.articleid}">
            <b class="popup-header-text">${beverage.name} (${beverage.articleid})</b>
            <span class="close" onclick="closeStockPopup()">&times;</span>
          </div>
          <div class="popup-body">
            <div>
              <label for="stockAmount">Amount in Stock:</label>
              <br><input type="text" id="stockAmount" value="${drinkInStock.in_stock}">
            </div>
            <div>
              <label for="drinkPrice">Price (SEK):</label>
              <br><input type="text" id="drinkPrice" value="${drinkInStock.sale_price}">
            </div>
          </div>
          <button class="submit-btn" onclick="handleEditDrinkInStockSubmission()">Submit Change</button>
        </div>
    `;

    return popUpContent;
}

// Function to create HTML for the footer of a drink card
function createCardFooterHTML(aggregatedDrink) {
    return `
        <div class="stock-card-footer">
            <button id="menuBtn-${aggregatedDrink.articleid}" class="${aggregatedDrink.on_menu ? 'onMenuBtn' : 'notOnMenuBtn'}" onclick="toggleMenuFlag(${aggregatedDrink.articleid})">
                <img src="./images/Icons/menu-icon-black.png" alt="Menu Icon" class="menu-icon">
                ${aggregatedDrink.on_menu ? 'On Menu' : 'Not On Menu'}
            </button>
        </div>
    `;
}

// Function to create popup HTML in order to add drink to stock from beverages db
function createOrderBeveragesPopUpHTML() {
    const beverages = getAllBeverages();
    const popUpTableRowsHTML = createPopUpTableRowsHTML(beverages).join('');

    const popupContent = `
        <div class="popup-content" id="popup-content-add-to-stock">
            <span class="close" onclick="closeStockPopup()">&times;</span>
            <h2>Add Drink to Stock</h2>
            <input type="text" id="searchBeverageInput" placeholder="Search..." oninput="filterBeverages()">
            <input type="checkbox" id="filterOrderAmount" onchange="filterBeverages()"> Items to be ordered
            <div class="table-container">
                <table id="beverageTable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Country</th>
                            <th>Packaging</th>
                            <th>Strength</th>
                            <th>Price</th>
                            <th>Order</th>
                        </tr>
                    </thead>
                    <tbody id="beverageList">
                        ${popUpTableRowsHTML}
                        <!-- Table rows will be dynamically modified through filter functions -->
                    </tbody>
                </table>
            </div>
            <button class="submit-btn" onclick="submitBeverageOrder()">Submit Order</button>
        </div>
    `;
    return popupContent;
}

// Function to create HTML table rows based on given beverages
function createPopUpTableRowsHTML(beverages) {
    const tableRowsHTML = beverages.map(beverage => {
        // Retrieve the order amount from sessionStorage
        const storedQuantity = getBeverageOrderQuantity(beverage.articleid);
        const orderQuantity = storedQuantity !== null ? parseInt(storedQuantity) : "";

        const row = `
            <tr>
                <td>${beverage.name} ${beverage.name2}</td>
                <td>${beverage.countryoforiginlandname}${beverage.countryoforigin ? ": " + beverage.countryoforigin : ""}</td>
                <td>${beverage.packaging}</td>
                <td>${beverage.alcoholstrength}</td>
                <td>${beverage.priceinclvat}</td>
                <td>
                    <input type="number" id="orderQuantity-${beverage.articleid}" class="orderQuantity" min="0" value="${orderQuantity}" onchange="handleBeverageOrderQuantityChange(${beverage.articleid})">
                </td>
            </tr>
        `;

        return row;
    })

    return tableRowsHTML;
}

/*------------------------------------------Helper functions------------------------------------------------*/
/*------------------------------------------Helper functions------------------------------------------------*/
/*------------------------------------------Helper functions------------------------------------------------*/

// Filter stock based on user input in filter section/component
function filterStock() {
    const stock = getStock();

    const searchTerm = $(searchDrinkInput).val();
    const lowStock = $('#lowStockCheckbox').is(':checked');
    const outOfStock = $('#outOfStockCheckbox').is(':checked');

    var filteredStock = stock.filter(function(drink) {
        var containsSearchTerm = drink.name.toLowerCase().includes(searchTerm.toLowerCase())
        if (lowStock && drink.in_stock > 0 && drink.in_stock < 10) {
            return containsSearchTerm; // Drink is low in stock
        }
        if (outOfStock && drink.in_stock === 0) {
            return containsSearchTerm; // Drink is out of stock
        }
        if (!lowStock && !outOfStock) {
            return containsSearchTerm; // No filters applied
        }
    });

    return filteredStock;
}

// Function to determine label for the drink cards (Possibly removed soon)
function determineTypeLabel(category) {
    switch (category) {
        case 'beer':
            return ' (Beer)';
        case 'wine':
            return ' (Wine)';
        case 'cocktail':
            return ' (Cocktail)';
        case 'spirit':
            return ' (Spirit)';
        default:
            return '';
    }
}

// Function being called when menu button on a drink card is clicked, so that the on_menu flag in the db gets toggled
function toggleMenuFlag(articleId) {
    var onMenu = $('#menuBtn-' + articleId).hasClass("onMenuBtn");
    updateDrinkOnMenuFlag(articleId, !onMenu);
    displayStockManagement();
};

// Function to open the pop up to add drinks from beverage db to stock
function openAddDrinkToStockPopUp() {
    document.getElementById('popup').style.display = 'flex';
    const popupContent = createOrderBeveragesPopUpHTML();
    document.querySelector('#popup').innerHTML = popupContent;
}

// Function to filter beverages displayed in the pop up (to add drinks from beverage db to stock)
function filterBeverages() {
    const searchTerm = document.getElementById('searchBeverageInput').value.toLowerCase();
    const filterOrderAmount = document.getElementById('filterOrderAmount').checked;
    const filteredBeverages = getAllBeverages().filter(beverage => {
        const matchesSearchTerm = beverage.name.toLowerCase().includes(searchTerm);
        const meetsOrderAmountFilter = !filterOrderAmount || getBeverageOrderQuantity(beverage.articleid) > 0;
        return matchesSearchTerm && meetsOrderAmountFilter;
    });
    
    const popUpTableRowsHTML = createPopUpTableRowsHTML(filteredBeverages).join('');
    $('#beverageList').html(popUpTableRowsHTML);
}

// This function gets called when the user changes the number/quanitity of a beverage he/she wants to order
// Is necessary to store it in the session storage as it would otherwise get removed as soon as a user would filter the beverages displayed which would rerender the table and so the entered number for a beverage
function handleBeverageOrderQuantityChange(articleId) {
    var quantityValue = $("#orderQuantity-" + articleId).val()
    const quantity = parseInt(quantityValue);
    updateOrderAmount(articleId, quantity);
};

// Gets order quantity of a beverage from the session storage
function getBeverageOrderQuantity(articleId) {
    // Retrieve the orderAmount object from sessionStorage
    const orderAmounts = JSON.parse(sessionStorage.getItem('orderAmounts')) || {};
    return orderAmounts[articleId] || 0; // Return 0 if no order amount is found
}

// When changing the order quantity for a beverage, the function is called to store it in the session storage
function updateOrderAmount(articleId, quantity) {
    const orderAmounts = JSON.parse(sessionStorage.getItem('orderAmounts')) || {};
    orderAmounts[articleId] = quantity;
    sessionStorage.setItem('orderAmounts', JSON.stringify(orderAmounts));
}

// Gets called when the user submits the order of beverages in the opened pop up
function submitBeverageOrder() {
    var orderAmounts = JSON.parse(sessionStorage.getItem('orderAmounts'))
    for (const articleId in orderAmounts) {
        if (orderAmounts.hasOwnProperty(articleId)) {
            const quantity = orderAmounts[articleId];
            const beverage = getBeverageByArticleId(articleId);
            
            const stockObj = transformToStock(beverage, quantity);
            addDrinkToStock(stockObj);
        }
    }      

    closeStockPopup();
}

// Function needed in order to transform a beverage db object to a stock db object
function transformToStock(beverage, quantity) {
    var type = determineType(beverage);
    return {
        "article_id": beverage.articleid,
        "name": beverage.name,
        "beer": type == 'beer', 
        "wine": type == "wine", 
        "spirit": type == 'spirit', 
        "year": beverage.productionyear,
        "country": beverage.countryoforiginlandname || "",
        "volume_ml": beverage.volumeml,
        "alcohol_percentage": parseFloat(beverage.alcoholstrength),
        "sale_price": parseFloat(beverage.priceinclvat),
        "in_stock": quantity,
        "on_menu": false 
    };
}

// Determines if a beverage or drink is a beer, wine, spirit or cocktail
function determineType(beverage) {
    const categoryLower = beverage.catgegory ? beverage.catgegory.toLowerCase() : "";
    if (categoryLower.includes('beer') || categoryLower.includes('öl') || categoryLower.includes('ã–l') || categoryLower.includes('ale') || categoryLower.includes('lager') || categoryLower.includes('\u00c3\u2013l')) {
        return 'beer';
    } else if (categoryLower.includes('wine') || categoryLower.includes('vin') || (parseFloat(beverage.alcoholstrength) > 10 && parseFloat(beverage.alcoholstrength) < 19)) {
        return 'wine';
    } else if (categoryLower.includes('sprit') || categoryLower.includes('spirit') || parseFloat(beverage.alcoholstrength) > 19) {
        return 'spirit';
    } else if (beverage.cocktail) {
        return 'cocktail';
    } else {
        console.log(beverage)
        return 'unknown';
    }
}

// Closes the possibly opened pop ups
function closeStockPopup() {
    document.getElementById('popup').style.display = 'none';
    sessionStorage.removeItem('orderAmounts');
    displayStockManagement();
}

// Function to toggle dropdown content
function toggleDropdown(articleId) {
    //TODO: Fix bug - When scrolling down the dropdowns are either displaced or not visible
    var dropdownContent = $('#dropdown-content-' + articleId);
    if (dropdownContent.css('display') === 'none') {
      dropdownContent.css('display', 'block');
    } else {
      dropdownContent.css('display', 'none');
    }
}

// Function called to open a pop up which allows the user to edit certain properties (amount, price) of a drink in the stock db
function editDrinkInStock(articleId) {
    var beverage = getBeverageByArticleId(articleId);
    var drinkInStock = getDrinkInStockById(articleId);

    const popupContent = createEditDrinkInStockPopUp(beverage, drinkInStock);
    document.getElementById('popup').style.display = 'flex';
    document.querySelector('#popup').innerHTML = popupContent;
}

// Function called when the user wants to submit changes of a drink in the stock db (changes regarding the amount and price)
function handleEditDrinkInStockSubmission() {
    var article_id = $('.popup-header').attr('articleid');
    var stockAmount = $('#stockAmount').val();
    var drinkPrice = $('#drinkPrice').val();
    updateAmountAndPriceOfDrinkInStock(article_id, stockAmount, drinkPrice);
    closeStockPopup();
    displayStockManagement();
}

// Function called when the user decides to delete a drink from stock
function deleteDrinkFromStock(articleId) {
    deleteDrinkInStockById(articleId);
    displayStockManagement();
}
