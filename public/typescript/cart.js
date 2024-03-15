export let sellable_products = new Map();
class Cart extends Map {
    removeItem(item) {
        this.set(item, this.get(item) - 1);
    }
    set(prop, value) {
        var _a, _b, _c;
        super.set(prop, value);
        if (document.getElementById(prop + "_cart") == null) {
            if (value == 0)
                return this;
            (_a = document.getElementById("cart")) === null || _a === void 0 ? void 0 : _a.insertAdjacentHTML("beforeend", `
                <div id=${prop}>
                    <h3 id="${prop + "_cart_amount"}">${value}</h3>
                    <h3 id="${prop + "_cart"}">${prop}</h3>
                    <h3 id="${prop + "_cart_price"}">${(value * sellable_products.get(prop) / 100).toFixed(2)}</h3>
                    <button id=${"remove" + prop}>X</button>
                </div>
            `);
            (_b = document.getElementById("remove" + prop)) === null || _b === void 0 ? void 0 : _b.addEventListener("click", (ev) => { this.removeItem(prop); });
        }
        if (value == 0) {
            //document.getElementById(prop+"_cart")?.remove();
            //document.getElementById(prop+"_cart_amount")?.remove();
            //document.getElementById(prop+"_cart_price")?.remove();
            (_c = document.getElementById(prop)) === null || _c === void 0 ? void 0 : _c.remove();
            return this;
        }
        document.getElementById(prop + "_cart_amount").innerText = value.toString();
        document.getElementById(prop + "_cart_price").innerHTML = (value * sellable_products.get(prop) / 100).toFixed(2);
        let total = 0;
        this.forEach((amount, prod) => {
            total += amount * sellable_products.get(prod);
        });
        document.getElementById("totAmount").innerHTML = (total / 100).toFixed(2) + " €";
        return this;
    }
    sendOrder(ws) {
        let msg = JSON.stringify({
            "type": "CreateOrder",
            "data": Object.fromEntries(this)
        });
        ws.send(msg);
    }
}
let cart = new Cart();
export default cart;
