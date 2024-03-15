//#region Utils

const delay = ms => new Promise(res => setTimeout(res, ms));

/*function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}*/

//#endregion

//FIXME: this code is a huge MESS
//TODO: Move cart to his own file
//TODO: Implement creating orders

//let sellable_products = {}

/*let cartHandler = {
  set(obj, prop, value) {
    obj[prop] = value;
    if (document.getElementById(prop+"_cart") == null) {
      if (value == 0) return true;
      document.getElementById("cart").insertAdjacentHTML("beforeend", `
      <div><h3 id="${prop+"_cart_amount"}">${value}</h3><h3 id="${prop+"_cart"}">${prop}</h3><h3 id="${prop+"_cart_price"}">${(value * sellable_products[prop] / 100).toFixed(2)}</h3></div>
      `);
    }
    if (value == 0) {
      document.getElementById(prop+"_cart").remove();
      document.getElementById(prop+"_cart_amount").remove();
      document.getElementById(prop+"_cart_price").remove();
      return true;
    }
    document.getElementById(prop+"_cart_amount").innerHTML = value;
    document.getElementById(prop+"_cart_price").innerHTML = (value * sellable_products[prop] / 100).toFixed(2);

    let total = 0;
    for (const [prod, amount] of Object.entries(obj)) {
      total += amount * sellable_products[prod]
    }
    document.getElementById("totAmount").innerHTML = (total / 100).toFixed(2) + " €";
    
    return true;
  },

}

let cartObj = {}
let cart = new Proxy(cartObj, cartHandler)
*/
function addProductToCart(ev) {
  let product = ev.target.id.replace("menu_item", "")
  //let price = sellable_products[product]
  if (Object.hasOwn(cart, product)) {
    cart[product] = cart[product] + 1;
    
    return;
  }
  cart[product] = 1;
}

function init() {
  $(document).on("click", ".ordinazione", expandOrder);

  fetch("http://" + window.location.host + "/products").then(res => res.json()).then((products) => {
    sellable_products = products
    let menu = document.getElementById("menu");
    Object.entries(sellable_products).forEach(function ([product, price]) {
      menu.insertAdjacentHTML("beforeend", `<div id=${product + "menu_item"} class="menu-item"> \n
      <h3>${product}</h3> \n
      <h4>${(price / 100).toFixed(2) + "€"}</h4> \n
      </div>`);
      document.getElementById(product + "menu_item").addEventListener("click", addProductToCart);
    })
  })
}

// product:
/*  id: number;
    name: string;
    state: State;
    amount: number; */

//#region Event Handlers

function expandOrder(ev) {
  ev.target.setAttribute("espanso", ev.target.getAttribute("espanso") === "false" ? "true" : "false")
}

function openCreateOrderScreen() {
  document.getElementById("order-screen").removeAttribute("hidden")
}

//#endregion

//#region API

async function createOrder(products, done) {
  fetch("http://" + window.location.host + "/api/create-order", {
    method: "POST",
    body: JSON.stringify({
      products: products,
      done: done
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  });
}

const State = {
  Preparing: 0,
  ToDeliver: 1,
  Delivered: 2,
}

async function getProductsOfOrder(id) {
  return await fetch("http://" + window.location.host + "/api/order/" + id + "/products").then(res => res.json())
}

//#endregion

async function UpdateOrders() {
  let res = await fetch("http://" + window.location.host + "/api/orders/todo")
  let orders = await res.json()

  let DivOrdinazioni = document.getElementById('ordinazioni');
  DivOrdinazioni.innerHTML= "";
  orders.forEach(async (order) => {
    if (document.getElementById(order._id) == null) {
      let products = await getProductsOfOrder(order.id);
      let productsHTML = "";
      products.forEach((product) => {
        productsHTML += `<h5>${product.amount} - ${product.name}: ${getKeyByValue(State, product.state)} </h5> \n`;
      })
      DivOrdinazioni.innerHTML += `
        <div id="${order._id}" class="ordinazione" espanso="false">
          <h4>Ordinazione ${order.id}</h4>
          <h4 class="order-state" fatto="${order.done}">${order.done ? "Fatto" : "Da fare"}</h4>
          ${productsHTML}
        </div>
      `;
    }
  })
}

UpdateOrders()

async function MainLoop() {
  init();
  while (true) {
    await delay(5000)
    UpdateOrders();
  }
}

window.onload = MainLoop;
//MainLoop()