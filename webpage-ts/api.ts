
export interface IOrder {
    id: number;
    orderTime: Date;
    done: boolean;    
}

export enum State {
    Preparing = 0,
    ToDeliver = 1,
    Delivered = 2,
}

export interface IProduct {
    id: number;
    name: string;
    state: State;
    amount: number;
}

export async function createOrder(products: Map<String, number>, done: boolean) {
    let res = await fetch("http://" + window.location.host + "/api/create-order", {
        method: "POST",
        body: JSON.stringify({
            products: products,
            done: done
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });

    if (!res.ok) {
        throw new Error("Could not create Order");
    } 
}