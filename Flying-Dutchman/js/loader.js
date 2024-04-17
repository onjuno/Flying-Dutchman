/*--------------------------- Basic database functions----------------------------------*/
/*--------------------------- Basic database functions----------------------------------*/
/*--------------------------- Basic database functions----------------------------------*/

// Load initial data into sessionStorage
function initDB() {
    if (getTableData('Users').length == 0) {
        loadInitialData('Users', DB_USERS);
    }
    if (getTableData('CustomerAccounts').length == 0) {
        loadInitialData('CustomerAccounts', CUSTOMER_ACCOUNTS_DB);
    }
    if (getTableData('Orders').length == 0) {
        loadInitialData('Orders', ORDERS_DB);
    }
    if (getTableData('RestockOrders').length == 0) {
        loadInitialData('RestockOrders', RESTOCK_ORDERS_DB);
    }
    if (getTableData('Stock').length == 0) {
        loadInitialData('Stock', DB_STOCK);
    }   
}

// Function to load initial data into sessionStorage
function loadInitialData(tableName, data) {
    sessionStorage.setItem(tableName, JSON.stringify(data));
}

// Function to retrieve data from sessionStorage
function getTableData(tableName) {
    return JSON.parse(sessionStorage.getItem(tableName)) || [];
}

// Function to update data in sessionStorage
function updateTableData(tableName, updatedTable) {
    sessionStorage.setItem(tableName, JSON.stringify(updatedTable));
}

// Function to update a single JSON object in a table
function updateObjectInTable(tableName, idFieldName, newEntry) {
    // Retrieve data from sessionStorage
    var tableData = getTableData(tableName);

    // Undo/Redo
    updateUndoRedo(tableName, tableData);

    // Find the index of the object with the specified objectId
    var index = tableData.findIndex(obj => obj[idFieldName] === newEntry[idFieldName]);

    // If the object exists in the table, update it
    if (index !== -1) {
        tableData[index] = { ...tableData[index], ...newEntry }; // Merge existing data with new data
        updateTableData(tableName, tableData); // Update data in sessionStorage
        return true; // Return true to indicate success
    } else {
        return false; // Return false to indicate object not found
    }
}

// Function to add a new object to a table
function addObjectToTable(tableName, newData) {
    // Retrieve data from sessionStorage
    var tableData = getTableData(tableName);

    // Undo/Redo
    updateUndoRedo(tableName, tableData);

    // Add the new object to the table
    tableData.push(newData);

    // Update data in sessionStorage
    updateTableData(tableName, tableData);
}

// Function to delete an object from a table
function deleteObjectFromTable(tableName, objectId, idFieldName) {
    // Retrieve data from sessionStorage
    var tableData = getTableData(tableName);

    // Undo/Redo
    updateUndoRedo(tableName, tableData);

    // Find the index of the object with the specified objectId
    var index = tableData.findIndex(obj => obj[idFieldName] == objectId);

    // If the object exists in the table, delete it
    if (index !== -1) {
        tableData.splice(index, 1); // Remove the object from the array
        updateTableData(tableName, tableData); // Update data in sessionStorage
        return true; // Return true to indicate success
    } else {
        return false; // Return false to indicate object not found
    }
}

// Function to generate a unique ID for a new object
function generateUniqueId(tableName, idFieldName) {
    // Assuming each object has an 'id' property, generate a unique ID
    // Here, you can use any suitable logic to generate unique IDs
    // For example, you can use a random number generator or a timestamp
    // In this example, we'll generate a random number until it's unique
    var tableData = getTableData(tableName);
    var newId;
    do {
        newId = Math.floor(Math.random() * 1000); // Generate a random number (change as needed)
    } while (tableData.some(obj => obj[idFieldName] === newId)); // Check if the ID is already used
    return newId;
}


/*--------------------------- Beverage database functions----------------------------------*/
/*--------------------------- Beverage database functions----------------------------------*/
/*--------------------------- Beverage database functions----------------------------------*/

function getAllBeverages() {
    return BEVERAGES_DB;
}

function getBeverageByArticleId(article_id) {
    return getAllBeverages().find(beverage => beverage.articleid == article_id);
}

// drinks is a list different to the beverage list, but contains other information of a drink with article_id
// Purpose of this function is to merge the the object/drink information together
function aggregateStockWithInformationFromBeverageDB(stock) {
    // Merge attributes from list2 into list1 objects
    return stock.map(drink => {
        const matchingDrink = getBeverageByArticleId(drink.article_id);
        // Merge attributes from matching object in list2
        return Object.assign(drink, matchingDrink);
    });
  }

/*--------------------------- Users database functions----------------------------------*/
/*--------------------------- Users database functions----------------------------------*/
/*--------------------------- Users database functions----------------------------------*/



/*--------------------------- Stock database functions----------------------------------*/
/*--------------------------- Stock database functions----------------------------------*/
/*--------------------------- Stock database functions----------------------------------*/

function getStock() {
    return getTableData('Stock');
}

function getDrinkInStockById(article_id) {
    return getStock().find(drink => drink.article_id == article_id);
}

function addDrinkToStock(stockObj) {
    addObjectToTable('Stock', stockObj);
}

function deleteDrinkInStockById(article_id) {
    deleteObjectFromTable('Stock', article_id, 'article_id')
}


function updateAmountAndPriceOfDrinkInStock(article_id, newAmount, newPrice) {
    const drink = getDrinkInStockById(article_id);

    // If the item exists in the database
    if (drink !== null) {
        // Update the sale_price for the item
        drink.in_stock = newAmount;
        drink.sale_price = newPrice;
        updateObjectInTable('Stock', 'article_id', drink)
    } else {
        console.log(`Drink with article_id ${article_id} not found in the stock database`);
    }
}

function updateDrinkOnMenuFlag(article_id, on_menu) {
    const drink = getDrinkInStockById(article_id);

    // If the item exists in the database
    if (drink !== null) {
        // Update the sale_price for the item
        drink.on_menu = on_menu;
        updateObjectInTable('Stock', 'article_id', drink)
    } else {
        console.log(`Drink with article_id ${article_id} not found in the stock database`);
    }
}

/*--------------------------- Orders database functions----------------------------------*/
/*--------------------------- Orders database functions----------------------------------*/
/*--------------------------- Orders database functions----------------------------------*/

function getAllOrders() {
    return getTableData('Orders');
}

function getOrderById(id) {
    return getAllOrders().find(order => order.order_id == id);
}

function getUnpaidOrders() {
    return getAllOrders().filter(order => !order.paid);
}

function updateOrder(updatedOrder) {
    updateObjectInTable('Orders', 'order_id', updatedOrder)
}

function deleteOrder(orderId) {
    deleteObjectFromTable('Orders', orderId, "order_id");
}

function getDrinksForOrder(order_id) {
    var drinks = []
    
    var order = getOrderById(order_id)
    order.drinks.forEach(drink => {
        var beverage = getBeverageByArticleId(drink.article_id);
        drinks.push(beverage)
    }) 
    
    return drinks;
}

function getDrinkByOrderIdAndDrinkId(order_id, article_id) {
    return getOrderById(order_id).drinks.find(drink => drink.article_id == article_id)
}

function getAmountOfOrderedDrink(order_id, article_id) {
    return getDrinkByOrderIdAndDrinkId(order_id, article_id).amount;
}

function updateDrinkInOrder(order_id, updatedOrderedDrink) {
    // Get the order by ID
    var order = getOrderById(order_id);

    // Find the index of the drink with matching article_id
    var index = order.drinks.findIndex(function(drink) {
        return Number(drink.article_id) === Number(updatedOrderedDrink.article_id);
    });

    // If the drink is found, update it
    if (index !== -1) {
        order.drinks[index] = updatedOrderedDrink;
        // Update the order in the database
        updateObjectInTable('Orders', 'order_id', order);
    } else {
        // Handle case where the drink is not found (optional)
        console.log("Drink with article_id " + updatedOrderedDrink.article_id + " not found in order " + order_id);
    }
}

function createNewOrder(tableNr, orderDrinks) {
    var uniqueId = generateUniqueId('Orders', 'order_id');
    var sumPrice = 0;
    orderDrinks.forEach(drink => {
        sumPrice += drink.single_price * drink.amount
    })

    var newOrderObj = {
        "order_id": uniqueId,
        "table_nr": tableNr,
        "drinks": orderDrinks,
        "sum_price": sumPrice,
        "comment": "No modification",
        "timestamp": formatDate(new Date()),
        "paid": false
    }

    addObjectToTable('Orders', newOrderObj);
    console.log(newOrderObj)
}

function formatDate(date) {
    // Convert the date to ISO format and split it into date and time parts
    const isoDateTime = date.toISOString().split('T');
    const isoDate = isoDateTime[0];
    const isoTime = isoDateTime[1].split('.')[0]; // Remove milliseconds

    // Concatenate the date and time parts with a space in between
    return `${isoDate} ${isoTime}`;
}


/*--------------------------- RestockOrders database functions----------------------------------*/



/*--------------------------- CustomerAccount database functions----------------------------------*/




initDB();