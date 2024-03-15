import { IOrder, IProduct, State } from "./api.js"
import { getKeyByValue } from "./utils.js"
import cart, {sellable_products} from "./cart.js"

function expandOrder(ev: Event) {
    let order = ev.target as HTMLElement;
    order.setAttribute("espanso", order.getAttribute("espanso") === "false" ? "true" : "false")
}

function addProductToCart(ev : MouseEvent) {
    let product = (ev.target as Element).id.replace("menu_item", "")
    //let price = sellable_products[product]
    if (cart.has(product)) {
      cart.set(product, (cart.get(product) as number) + 1)
      
      return;
    }
    cart.set(product, 1);
}

function openCreateOrderScreen() {
    document.getElementById("order-screen")?.removeAttribute("hidden")
    document.getElementById("order-screen-bg")?.removeAttribute("hidden")
}

function hideCreateOrderScreen() {
    document.getElementById("order-screen")?.setAttribute("hidden", "true")
    document.getElementById("order-screen-bg")?.setAttribute("hidden", "true")
}

type WebSocketMsg = {
    type: string,
    data: Object
}

let data = {
    "type": "GetOrdersToDo",
    "data": {}
}

let ws = new WebSocket("ws://localhost:3000")
ws.onopen = (ev) => {
    ws.send(JSON.stringify(data))
}

let requestProducts = (id: number) => ({
    "type": "GetProductsOfOrder",
    "data": {id}
})

ws.onmessage = (ev) => {
    let msg = JSON.parse(ev.data)
    if (msg as WebSocketMsg) {
        switch (msg.type) {
            case "GetOrdersResp": {
                let orders = (msg.data as Array<IOrder>)
                console.log(orders);
                let DivOrdinazioni = document.getElementById("ordinazioni")
                orders.forEach((order) => {
                    ws.send(JSON.stringify(requestProducts(order.id)))
                    let orderDiv = `
                    <div id="order${order.id}" class="ordinazione" espanso="false">
                        <h4>Ordinazione ${order.id}</h4>
                        <h4 class="order-state" fatto="${order.done}">${order.done ? "Fatto" : "Da fare"}</h4>
                    </div>`
                    DivOrdinazioni?.insertAdjacentHTML("beforeend", orderDiv)
                    //document.getElementById("order" + order.id)?.addEventListener("click", expandOrder)
                })
                break;
            }
            case "GetProductsResp": {
                let products = (msg.data.products as Array<IProduct>)
                console.log(products)
                if (products.length <= 0) break;
                let productsHTML = "";
                products.forEach((prod) => {
                    console.log(prod)
                    productsHTML += `<h5>${prod.amount} - ${prod.name}: ${getKeyByValue(State, prod.state)} </h5> \n`;
                })
                document.getElementById("order"+products[0].id)?.insertAdjacentHTML("beforeend", productsHTML)
                break;
            }
            case "CreateOrder": {
                let products: Map<string, number> = new Map(Object.entries(msg.data.products))
                let productsHTML = "";
                products.forEach((amount, prod) => {
                    productsHTML += `<h5>${amount} - ${prod}: Preparing </h5> \n`;
                })
                let orderHTML = `
                <div id="order${msg.data.id}" class="ordinazione" espanso="false">
                    <h4>Ordinazione ${msg.data.id}</h4>
                    <h4 class="order-state" fatto="false">Da fare</h4>
                    ${productsHTML}
                </div>`;
                (document.getElementById("ordinazioni") as HTMLElement).insertAdjacentHTML("afterbegin", orderHTML);
                break;
            }
        }
    }
    else
        return;
}

function sendOrder(ev: Event) {
    cart.sendOrder(ws)
    hideCreateOrderScreen();
} 

function init() {
    $(document).on("click", ".ordinazione", expandOrder);
  
    fetch("http://" + window.location.host + "/products").then(res => res.json()).then((products) => {
        Object.entries(products).forEach( function ([product, price]) {
          sellable_products.set(product, price as number);
        })
        let menu = document.getElementById("menu") as HTMLElement;
        sellable_products.forEach(function (price, product) {
            menu.insertAdjacentHTML("beforeend", `<div id=${product + "menu_item"} class="menu-item"> \n
            <h3>${product}</h3> \n
            <h4>${(price / 100).toFixed(2) + "€"}</h4> \n
            </div>`);
            document.getElementById(product + "menu_item")?.addEventListener("click", addProductToCart);
        })
    })
    document.getElementById("send-order")?.addEventListener("click", sendOrder)
    document.getElementsByClassName("create-order-btn")[0].addEventListener("click", openCreateOrderScreen)
    document.getElementById("order-screen-bg")?.addEventListener("click", hideCreateOrderScreen)
}

window.onload = init;
window.onkeydown = (ev) => {
    if (ev.key == "k") cart.sendOrder(ws)
}