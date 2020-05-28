"use strict";
var App = (function () {
    function App() {
    }
    App.prototype.getSelectValue = function (select) {
        return select.options[select.selectedIndex].value;
    };
    App.prototype.generateId = function () {
        return Date.now().toString(36) + "-" + Math.random().toString(36).substr(2);
    };
    return App;
}());
var selectedProductList = [];
var shoppingListTable;
var productName;
var productAmount;
var categorySelect;
function loadFromFile() {
    var file = document.getElementById("file-selector").files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        selectedProductList = JSON.parse(e.target.result);
        renderProductList();
    };
    reader.readAsText(file);
}
function save() {
    localStorage.setItem("list", JSON.stringify(selectedProductList));
}
function load() {
    selectedProductList = JSON.parse(localStorage.getItem("list"));
    renderProductList();
}
function mark(id) {
    selectedProductList = selectedProductList.map(function (product) {
        if (product.id === id) {
            product.checked = !product.checked;
        }
        return product;
    });
    renderProductList();
}
function remove(id) {
    selectedProductList = selectedProductList.filter(function (product) { return product.id !== id; });
    renderProductList();
}
function edit(id) {
    selectedProductList = selectedProductList.filter(function (product) {
        if (product.id === id) {
            productName.value = product.name;
            productAmount.value = product.amount;
            categorySelect.value = product.category;
            return false;
        }
        return true;
    });
    renderProductList();
}
function groupProductsByCategory(products) {
    return products.reduce(function (group, obj) {
        var key = obj.category;
        if (!group[key]) {
            group[key] = [];
        }
        group[key].push(obj);
        return group;
    }, {});
}
function renderProductList() {
    if (shoppingListTable) {
        shoppingListTable.remove();
    }
    shoppingListTable = document.createElement("table");
    shoppingListTable.id = "shoppingListTable";
    shoppingListTable.style.width = "100%";
    document.getElementById("shopping-list").appendChild(shoppingListTable);
    var groups = groupProductsByCategory(selectedProductList);
    for (var group in groups) {
        var row = shoppingListTable.insertRow();
        var col = row.insertCell(0);
        col.innerHTML = group;
        col.style.borderBottom = "1px dashed";
        col.style.paddingTop = "1em";
        col.style.fontWeight = "bold";
        col.style.opacity = "0.5";
        col.colSpan = 5;
        groups[group].forEach(function (item) {
            var row = shoppingListTable.insertRow();
            row.insertCell(0).innerHTML = "<button class=\"btn btn-outline-secondary\" onclick='mark(\"" + item.id + "\")'><i class=\"fa fa-check\"></i></button>";
            if (item.checked) {
                row.insertCell(1).innerHTML = '<span style="text-decoration:line-through">' + item.name + '</span>';
            }
            else {
                row.insertCell(1).innerHTML = item.name;
            }
            row.insertCell(2).innerHTML = item.amount;
            row.insertCell(3).innerHTML = "<button class=\"btn btn-outline-secondary\" onclick='edit(\"" + item.id + "\")'><i class=\"fa fa-pencil\"></i></button>";
            row.insertCell(4).innerHTML = "<button class=\"btn btn-outline-secondary\" onclick='remove(\"" + item.id + "\")'><i class=\"fa fa-times\"></i></button>";
        });
    }
}
window.onload = function () {
    var app = new App();
    categorySelect = document.getElementById("select1");
    productName = document.getElementById("productName");
    productAmount = document.getElementById("productAmount");
    var addProductBtn = document.getElementById("addProduct");
    CATEGORIES.forEach(function (item) {
        var option = document.createElement("option");
        option.innerText = item;
        option.value = item;
        categorySelect.appendChild(option);
    });
    addProductBtn.onclick = function () {
        var selectedProduct = {
            id: app.generateId(),
            category: categorySelect.options[categorySelect.selectedIndex].text,
            name: productName.value,
            checked: false,
            amount: productAmount.value
        };
        selectedProductList.push(selectedProduct);
        renderProductList();
        productName.value = "";
        productAmount.value = "";
    };
    categorySelect.dispatchEvent(new Event('change'));
};
var CATEGORIES = ["Warzywa", "Owoce", "Nabiał", "Śniadaniowe", "Mięso", "Słodycze", "Napoje", "Chemia", "Różne"];
