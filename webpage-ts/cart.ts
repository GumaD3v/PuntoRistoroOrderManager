export let sellable_products: Map<string, number> = new Map();

class Cart extends Map<string,number>{

    removeItem(item: string) {
        this.set(item, (this.get(item) as number) - 1)
    }

    set(prop: string, value: number): this {
        super.set(prop, value);
        if (document.getElementById(prop+"_cart") == null) {
            if (value == 0) return this;
            document.getElementById("cart")?.insertAdjacentHTML("beforeend", `
                <div id=${prop}>
                    <h3 id="${prop+"_cart_amount"}">${value}</h3>
                    <h3 id="${prop+"_cart"}">${prop}</h3>
                    <h3 id="${prop+"_cart_price"}">${(value * (sellable_products.get(prop) as number) / 100).toFixed(2)}</h3>
                    <button id=${"remove"+prop}>X</button>
                </div>
            `);
            document.getElementById("remove"+prop)?.addEventListener("click", (ev) => {this.removeItem(prop)})
        }
        if (value == 0) {
            //document.getElementById(prop+"_cart")?.remove();
            //document.getElementById(prop+"_cart_amount")?.remove();
            //document.getElementById(prop+"_cart_price")?.remove();
            document.getElementById(prop)?.remove();
            return this;
        }
        (document.getElementById(prop+"_cart_amount") as HTMLElement).innerText = value.toString();
        (document.getElementById(prop+"_cart_price") as HTMLElement).innerHTML = (value * (sellable_products.get(prop) as number) / 100).toFixed(2);

        let total = 0;
        this.forEach((amount, prod) => {
            total += amount * (sellable_products.get(prod) as number);
        });
        (document.getElementById("totAmount") as HTMLElement).innerHTML = (total / 100).toFixed(2) + " €";

        return this;
    }

    sendOrder(ws:WebSocket) {
        let msg = JSON.stringify({
            "type": "CreateOrder",
            "data": Object.fromEntries(this)
        })
        ws.send(msg)
    }
}

let cart = new Cart();

export default cart;