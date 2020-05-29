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
var shoppingListElement;
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
function saveListToStorage() {
    localStorage.setItem("list", JSON.stringify(selectedProductList));
}
function showAddProductForm() {
    document.getElementById('removeProduct').classList.add('d-none');
    document.getElementById('add-product-form').classList.toggle('d-none');
}
function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}
function exportToFile() {
    var textToSave = localStorage.getItem('list');
    var textToSaveAsBlob = new Blob([textToSave], { type: "text/plain" });
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileName = document.getElementById('input-file-name').value;
    var fileNameToSaveAs = 'zakupy';
    if (!fileName) {
        fileName = 'zakupy';
    }
    fileNameToSaveAs = fileName + '.zakupy';
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}
function loadListFromStorage() {
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
function removeProductFromList() {
    var productForm = document.getElementById('add-product-form');
    var id = productForm.getAttribute('data-selected-id');
    selectedProductList = selectedProductList.filter(function (product) { return product.id !== id; });
    productForm.removeAttribute('data-selected-id');
    renderProductList();
}
function remove(id) {
    selectedProductList = selectedProductList.filter(function (product) { return product.id !== id; });
    renderProductList();
}
function edit(id) {
    var product = selectedProductList.filter(function (p) { return p.id === id; })[0];
    productName.value = product.name;
    productAmount.value = product.amount;
    categorySelect.value = product.category;
    var productForm = document.getElementById('add-product-form');
    productForm.classList.remove('d-none');
    document.getElementById('removeProduct').classList.remove('d-none');
    productForm.setAttribute('data-selected-id', id);
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
    if (shoppingListElement) {
        shoppingListElement.remove();
    }
    shoppingListElement = document.createElement("div");
    shoppingListElement.id = "shoppingListTable";
    shoppingListElement.className = "list-group mt-3";
    document.body.appendChild(shoppingListElement);
    var groups = groupProductsByCategory(selectedProductList);
    for (var group in groups) {
        var listHeader = document.createElement("div");
        listHeader.className = "list-group-item list-group-item-secondary font-weight-bold";
        listHeader.innerText = group;
        shoppingListElement.appendChild(listHeader);
        groups[group].forEach(function (item) {
            var listItem = document.createElement("div");
            listItem.className = "list-group-item";
            if (item.checked) {
                listItem.classList.add('bg-success');
            }
            var btnIconClass = item.checked ? 'fa fa-check-square-o' : 'fa-square-o';
            var html = "<button class=\"btn btn-dark btn-sm mr-3\" onclick='mark(\"" + item.id + ("\")'><i class=\"fa " + btnIconClass + "\"></i></button>");
            html += item.name;
            html += "<span class=\"badge badge-light ml-3\">" + item.amount + "</span>";
            html += "<button class=\"btn btn-dark float-right btn-sm\" onclick='edit(\"" + item.id + "\")'><i class=\"fa fa-pencil\"></i></button>";
            listItem.innerHTML += html;
            shoppingListElement.appendChild(listItem);
        });
    }
    saveListToStorage();
}
window.onload = function () {
    var app = new App();
    categorySelect = document.getElementById("select1");
    productName = document.getElementById("productName");
    productAmount = document.getElementById("productAmount");
    var addProductBtn = document.getElementById("addProduct");
    loadListFromStorage();
    CATEGORIES.forEach(function (item) {
        var option = document.createElement("option");
        option.innerText = item;
        option.value = item;
        categorySelect.appendChild(option);
    });
    addProductBtn.onclick = function () {
        var productForm = document.getElementById('add-product-form');
        var selectedId = productForm.getAttribute('data-selected-id');
        if (selectedId) {
            removeProductFromList();
            productForm.removeAttribute('data-selected-id');
            productForm.classList.add('d-none');
            document.getElementById('removeProduct').classList.add('d-none');
        }
        var selectedProduct = {
            id: selectedId ? selectedId : app.generateId(),
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
};
var CATEGORIES = ["Warzywa", "Owoce", "Nabiał", "Śniadaniowe", "Mięso", "Słodycze", "Napoje", "Chemia", "Różne"];
