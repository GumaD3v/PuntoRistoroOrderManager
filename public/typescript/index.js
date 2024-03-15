import { State } from "./api.js";
import { getKeyByValue } from "./utils.js";
import cart, { sellable_products } from "./cart.js";
function expandOrder(ev) {
    let order = ev.target;
    order.setAttribute("espanso", order.getAttribute("espanso") === "false" ? "true" : "false");
}
function addProductToCart(ev) {
    let product = ev.target.id.replace("menu_item", "");
    //let price = sellable_products[product]
    if (cart.has(product)) {
        cart.set(product, cart.get(product) + 1);
        return;
    }
    cart.set(product, 1);
}
function openCreateOrderScreen() {
    var _a, _b;
    (_a = document.getElementById("order-screen")) === null || _a === void 0 ? void 0 : _a.removeAttribute("hidden");
    (_b = document.getElementById("order-screen-bg")) === null || _b === void 0 ? void 0 : _b.removeAttribute("hidden");
}
function hideCreateOrderScreen() {
    var _a, _b;
    (_a = document.getElementById("order-screen")) === null || _a === void 0 ? void 0 : _a.setAttribute("hidden", "true");
    (_b = document.getElementById("order-screen-bg")) === null || _b === void 0 ? void 0 : _b.setAttribute("hidden", "true");
}
let data = {
    "type": "GetOrdersToDo",
    "data": {}
};
let ws = new WebSocket("ws://localhost:3000");
ws.onopen = (ev) => {
    ws.send(JSON.stringify(data));
};
let requestProducts = (id) => ({
    "type": "GetProductsOfOrder",
    "data": { id }
});
ws.onmessage = (ev) => {
    var _a;
    let msg = JSON.parse(ev.data);
    if (msg) {
        switch (msg.type) {
            case "GetOrdersResp": {
                let orders = msg.data;
                console.log(orders);
                let DivOrdinazioni = document.getElementById("ordinazioni");
                orders.forEach((order) => {
                    ws.send(JSON.stringify(requestProducts(order.id)));
                    let orderDiv = `
                    <div id="order${order.id}" class="ordinazione" espanso="false">
                        <h4>Ordinazione ${order.id}</h4>
                        <h4 class="order-state" fatto="${order.done}">${order.done ? "Fatto" : "Da fare"}</h4>
                    </div>`;
                    DivOrdinazioni === null || DivOrdinazioni === void 0 ? void 0 : DivOrdinazioni.insertAdjacentHTML("beforeend", orderDiv);
                    //document.getElementById("order" + order.id)?.addEventListener("click", expandOrder)
                });
                break;
            }
            case "GetProductsResp": {
                let products = msg.data.products;
                console.log(products);
                if (products.length <= 0)
                    break;
                let productsHTML = "";
                products.forEach((prod) => {
                    console.log(prod);
                    productsHTML += `<h5>${prod.amount} - ${prod.name}: ${getKeyByValue(State, prod.state)} </h5> \n`;
                });
                (_a = document.getElementById("order" + products[0].id)) === null || _a === void 0 ? void 0 : _a.insertAdjacentHTML("beforeend", productsHTML);
                break;
            }
            case "CreateOrder": {
                let products = new Map(Object.entries(msg.data.products));
                let productsHTML = "";
                products.forEach((amount, prod) => {
                    productsHTML += `<h5>${amount} - ${prod}: Preparing </h5> \n`;
                });
                let orderHTML = `
                <div id="order${msg.data.id}" class="ordinazione" espanso="false">
                    <h4>Ordinazione ${msg.data.id}</h4>
                    <h4 class="order-state" fatto="false">Da fare</h4>
                    ${productsHTML}
                </div>`;
                document.getElementById("ordinazioni").insertAdjacentHTML("afterbegin", orderHTML);
                break;
            }
        }
    }
    else
        return;
};
function sendOrder(ev) {
    cart.sendOrder(ws);
    hideCreateOrderScreen();
}
function init() {
    var _a, _b;
    $(document).on("click", ".ordinazione", expandOrder);
    fetch("http://" + window.location.host + "/products").then(res => res.json()).then((products) => {
        Object.entries(products).forEach(function ([product, price]) {
            sellable_products.set(product, price);
        });
        let menu = document.getElementById("menu");
        sellable_products.forEach(function (price, product) {
            var _a;
            menu.insertAdjacentHTML("beforeend", `<div id=${product + "menu_item"} class="menu-item"> \n
            <h3>${product}</h3> \n
            <h4>${(price / 100).toFixed(2) + "€"}</h4> \n
            </div>`);
            (_a = document.getElementById(product + "menu_item")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", addProductToCart);
        });
    });
    (_a = document.getElementById("send-order")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", sendOrder);
    document.getElementsByClassName("create-order-btn")[0].addEventListener("click", openCreateOrderScreen);
    (_b = document.getElementById("order-screen-bg")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", hideCreateOrderScreen);
}
window.onload = init;
window.onkeydown = (ev) => {
    if (ev.key == "k")
        cart.sendOrder(ws);
};
