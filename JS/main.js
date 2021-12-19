// Menu Items Array
const menuItems = [
    { item_name: "Biryani", price: 750, cuisineType: "Mughlai" },
    { item_name: "Fried Rice", price: 450, cuisineType: "Chinese" },
    { item_name: "Chicken Noodles", price: 550, cuisineType: "Chinese" },
    { item_name: "Pasta", price: 950, cuisineType: 'Spanish' },
    { item_name: "Mandi", price: 150, cuisineType: 'Arab' },
    { item_name: "Tikka Masala", price: 250, cuisineType: 'Indian' },
];

// No Of Tables
const tables = [
    'Table-1', 'Table-2', 'Table-3', 'Table-4'
]

// On DOM creation
window.onload = () => {
    // console.log("working")
    makeMenu();
    makeTables();
    addTableListeners();
    addMenuItemListeners();
}

window.onbeforeunload = () => {
    sessionStorage.clear();
};





//Card Maker Functions
const makeMenuCard = (itemName, price, cuisineType) => {
    let menuCard =
        `<section class="menu-card" draggable = 'true'>
        <h2 class = "card-title">${itemName}</h2>
        <p class ="card-price">Price :${price}</p>
        <p class = "card-cuisine">Cuisine Type:${cuisineType}</p>
    </section>`;
    return menuCard;
}

const makeTableCard = (tableName) => {
    let tableCard =
        `<div class="table-card"  >
        <h2 class = "table-title">${tableName}</h2>
        <p class ="table-total">Price : 
        <p class='total'>0</p>
        <p class = 'table-total'>| Total Items :</p> 
        <p class='total-items'>
        0</p></p>
    </div>`;
    return tableCard;
}

//Table and Menu Makers

function makeTables() {
    let allTableCards = tables.map(table => makeTableCard(table));
    let divtables = document.getElementById('tables');
    allTableCards.forEach(tableCard => divtables.innerHTML += tableCard);
}

// Menu Maker
function makeMenu() {
    var menuCards = menuItems.map(menuItem => makeMenuCard(menuItem.item_name, menuItem.price, menuItem.cuisineType));
    var menu = document.getElementById('menu');
    menuCards.forEach(element => menu.innerHTML += element);
}

// Modal Maker Function to display Table Bill

function makeModal(ev) {
    let tableCard = ev.target.parentElement;
    if (tableCard.className != 'table-card')
        return;
    tableCard.className += ' clicked';
    let tableName = this.querySelector('h2').innerHTML;
    let JSONMap = JSON.parse(sessionStorage.getItem(tableName));
    JSONMap = JSONMap ?? []
    let dishMap = new Map(JSONMap);
    let items = makeItemsHtml(dishMap);
    let modal =
        `<div class="modal">
            <div class = 'modal-content'>
                <div class="modal-header">
                    <h2>${tableName} | Order Details</h2>
                    <span class = 'close-btn'>&times;</span>
                </div>
                <div class="modal-items">${items}</div>
                <hr/>
                <div class="modal-footer">
                    <p class = 'total-heading'>Total : <span class = 'total-modal-price'></span></p>
                    <p class = "footer-btn">Generate Bill(Close Session)</p>
                </div>
            </div>
        </div>`;
    document.body.innerHTML += modal;
    document.querySelector(".modal").style.display = 'block';
    document.querySelector('.close-btn').addEventListener('click',
        () => {
            removeBackground(getTableName());
            document.querySelector('.modal').remove();
            addTableListeners();
            addMenuItemListeners();
        });
    document.querySelector('.total-modal-price').innerHTML = this.querySelector('.total').innerHTML;
}

function removeBackground(tableName) {
    let tables = document.querySelectorAll('.table-card');
    for (let table of tables) {
        if (table.querySelector('.table-title').innerHTML == tableName) {
            table.className = 'table-card';
        }
    }
}

//Make Html for items in Modal
function makeItemsHtml(dishMap) {
    let itemHtml =
        `<div class='details-header'>
            <p>S.NO</p>
            <p>Item</p>
            <p class='price-column'>Price</p>
        </div>`;
    let i = 1;

    for (let [key, value] of dishMap) {
        let price = menuItems.filter(element => element.item_name == key)[0].price;
        itemHtml +=
            `<div class ='dish'>
                <p class='dish-number'>${i}</p>
                <p class='dish-name'>${key}</p>
                <p class ="dish-price">${price}</p>
                <input type='number' class='count-btn'  value ='${value}' min = 0 readonly>
                    <button class ="input-btn plus-btn" onclick = "incrementItem(this)">
                    +
                    </button>
                    <button class ='input-btn minus-btn' onclick = "changeItemQuantity(this)">
                    -
                    </button>    
                </input> 
                <span class ='delete-btn' onclick ="deleteElement(this)"><i class="fa fa-trash-o"></i></span>
            </div>`;
        i++;
    }//onchange = "changeItemQuantity()"
    return itemHtml;
}

// Making Items list for Modal .

function makeItemsList(tableItems) {
    let itemsHtml = `<div class = 'items'>`;
    for (let item of tableItems)
        itemsHtml += `<p class='item'>${item.item_name}</p>`;
    itemsHtml += '</div>';
    return itemsHtml;
}

/*  HTML DRAG AND DROP API EVENT LISTENERS */

//Drag TABLE
function dragOver(e) {
    e.preventDefault();
}


//DROP TABLE
function dragDrop(e) {
    let menuItem = JSON.parse(e.dataTransfer.getData("item"));
    let tableNumber = this.querySelector('h2').innerHTML;
    let dishName = menuItem.item_name;
    let total = this.querySelector('.total');
    let totalItems = 0;
    if (!sessionStorage.getItem(tableNumber)) {
        addNewMapIntoSession(dishName, tableNumber, menuItem, total);
        this.querySelector('.total-items').innerHTML = 1;
        totalItems = 1;
    }
    else {
        totalItems = changeMapItemsInSession(tableNumber, dishName, total, menuItem);
        this.querySelector('.total-items').innerHTML = totalItems;
    }
    sessionStorage.setItem(tableNumber + "totalItems" , totalItems);
    
}
// Helper method
function changeMapItemsInSession(tableNumber, dishName, total, menuItem) {
    let ordersMap = new Map(JSON.parse(sessionStorage.getItem(tableNumber)));
    if (ordersMap.get(dishName) == undefined)
        ordersMap.set(dishName, 1);

    else
        ordersMap.set(dishName, ordersMap.get(dishName) + 1);
    total.innerHTML = Number(total.innerHTML) + menuItem.price;
    sessionStorage.setItem(tableNumber, JSON.stringify(Array.from(ordersMap.entries())));
    sessionStorage.setItem(tableNumber + "totalprice", Number(sessionStorage.getItem(tableNumber + "totalprice")) + menuItem.price);
    let totalItems = 0;
    for (let [key, value] of ordersMap.entries()) {
        totalItems += Number(value);
    }
    return totalItems;
}
// Helper method
function addNewMapIntoSession(dishName, tableNumber, menuItem, total) {
    let map = new Map();
    map.set(dishName, 1);
    sessionStorage.setItem(tableNumber, JSON.stringify(Array.from(map.entries())));
    let totalPrice = menuItem.price + Number(sessionStorage.getItem(tableNumber + "totalprice"));
    sessionStorage.setItem(tableNumber + "totalprice", totalPrice);
    total.innerHTML = menuItem.price;
}

// Drag Start event -- > assigned to Element being Dragged.
function dragstart(ev) {

    let item = menuItems.map((element) => {
        if (this.querySelector('h2').innerHTML == element.item_name)
            return element;

    });
    item = item.filter((element) => element != null ? element : null);
    item = item[0];
    console.log(item);
    ev.dataTransfer.setData("item", JSON.stringify(item));
}


// Helper Methods

// Add event Listeners to Table cards
function addTableListeners() {
    let tables = document.querySelectorAll('.table-card');
    for (let table of tables) {
        table.addEventListener('dragover', dragOver);
        table.addEventListener('drop', dragDrop);
        table.addEventListener('click', makeModal);
    }
}

// Adding Listeners to Menu Cards
function addMenuItemListeners() {
    let menu = document.querySelectorAll('.menu-card');
    for (let menuItem of menu) {
        // menuItem.setAttribute('', true);
        menuItem.addEventListener('dragstart', dragstart);
    }
}


/*                      Search Section                              */


//table Search Function
function tableSearch() {
    let searchText = document.querySelector('.search-table').value.toLowerCase();
    let tables = Array.from(document.querySelectorAll('.table-card'));
    tables.forEach(element => {
        let title = element.querySelector('h2').innerHTML.toLowerCase();
        if (!title.includes(searchText)) {
            element.style.display = "none";
        }
        else if (searchText == "") {
            element.style.display = "block";
        }
    });

}

//Menu Search Function
function menuSearch() {
    let searchText = document.querySelector('.search-menu').value.toLowerCase();
    let menu = Array.from(document.querySelectorAll('.menu-card'));
    console.log(menu);
    menu.forEach(element => {
        let title = element.querySelector('h2').innerHTML.toLowerCase();
        let cuisineType = element.querySelector('p.card-cuisine').innerHTML.toLowerCase();
        if (!title.includes(searchText) && !cuisineType.includes(searchText)) {
            element.style.display = "none";
        }
        else if (searchText == "") {
            element.style.display = "block";
        }
    });

}

// Modal Helper Methods.
// - button on click
function changeItemQuantity(clickedItem) {
    let tableName = getTableName();
    let countBtn = clickedItem.parentElement.querySelector('.count-btn');
    countBtn.value = Number(countBtn.value) - 1;
    //console.log(clickedItem.parentElement);
    let key = clickedItem.parentElement.querySelector('.dish-name').innerHTML;
    if (countBtn.value == 0) {
        console.log(clickedItem.parentElement);
        deleteItemFromSession(clickedItem, tableName);
        changeSerialNumbers();
    }
    else {
        let itemMap = new Map(JSON.parse(sessionStorage.getItem(tableName)));
        itemMap.set(key, countBtn.value);
        sessionStorage.setItem(tableName, JSON.stringify(Array.from(itemMap.entries())));
    }
    updatePriceAndTotal(clickedItem.parentElement, key, tableName, 1, '-');
}

// Called by Delete Icon .
function deleteElement(pressedButton) {
    let tableName = getTableName();
    console.log(pressedButton);
    let key = pressedButton.parentElement.querySelector('.dish-name').innerHTML;
    deleteItemFromSession(pressedButton, tableName);
    updatePriceAndTotal(pressedButton.parentElement, key,
        tableName, Number(pressedButton.parentElement.querySelector('.count-btn').value), '-');
    changeSerialNumbers();
}

function changeSerialNumbers() {
    var items = document.querySelectorAll('.dish');
    let i = 1;
    for (let item of items) {
        item.querySelector('.dish-number').innerHTML = i++;
    }
}

// Retrieve Table Name from Modal Header.
function getTableName() {
    let tableName = document.querySelector('.modal-header');
    tableName = tableName.querySelector('h2').innerHTML;
    tableName = tableName.split(" ")[0];
    return tableName;
}

// Deleting Item from Session.
function deleteItemFromSession(clickedItem, tableName) {
    let parent = clickedItem.parentElement;
    console.log(parent)
    let itemMap = new Map(JSON.parse(sessionStorage.getItem(tableName)));
    itemMap.delete(parent.querySelector('.dish-name').innerHTML);
    parent.remove();
    sessionStorage.setItem(tableName, JSON.stringify(Array.from(itemMap)));
}

//Updating Total in Modal and Price in Table card
function updatePriceAndTotal(element, key, tableName, count, sign) {
    //console.log("Working - UpdatePriceAndTotal");
    let price = menuItems.filter(ele => ele.item_name == key)[0].price;
    let totalPrice = Number(sessionStorage.getItem(tableName + "totalprice"));
    totalPrice = sign == '-' ? totalPrice - price * (count ?? 1) : totalPrice + price * (count ?? 1);
    sessionStorage.setItem(tableName + "totalprice", totalPrice);
    document.querySelector(".total-modal-price").innerHTML = totalPrice;
    let tableCards = document.querySelectorAll('.table-card');
    for (let tableCard of tableCards) {
        //    console.log(tableCard);
        if (tableCard.querySelector('.table-title').innerHTML == tableName)
            tableCard.querySelector('.total').innerHTML = totalPrice;
    }
}

// + button on click
function incrementItem(clickedButton) {
    let inputField = clickedButton.parentElement.querySelector('.count-btn');
    inputField.value = Number(inputField.value) + 1;
    let key = clickedButton.parentElement.querySelector('.dish-name').innerHTML;
    let tableName = getTableName();
    updatePriceAndTotal(clickedButton.parentElement, key, tableName, 1, '+');
}



