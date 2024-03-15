import mongoose from "mongoose"

let initialized = false
let id = 0

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

const productSchema = new mongoose.Schema<IProduct>({
    id: { type: Number, required: true},
    name: { type: String, required: true},
    state: { type: Number, enum: State, required: true},
    amount: {type: Number, required: true}
})

const orderSchema = new mongoose.Schema<IOrder>({
    id: { type: Number, required: true },
    orderTime: { type: Date, required: true },
    done: { type: Boolean, required: true },
});

let Order: mongoose.Model<IOrder>;
let Product: mongoose.Model<IProduct>;

export type CreateOrder = {products: Map<String, number>, done: boolean}

export async function createOrder(order : CreateOrder): Promise<number> {
    if (!initialized) {
        console.error("DB not initialized");
        return -1;
    }
    id++;
    order.products.forEach(async (amount, product, _map) => {
        let prod = new Product( {id, name: product, state: (order.done ? State.Delivered : State.Preparing), amount} )
        await prod.save();
    })
    let orderTime = Date.now();
    let o = new Order({id, orderTime, ...order});
    await o.save();
    return id;
}
 
export async function getLatestOrders() {
    return Order.find({}).sort({ id: -1 }).limit(15).exec();
}
export async function getAllOrders() {
    return Order.find({}).sort({ id: -1 }).exec();
}
export async function getToDoOrders() {
    return Order.find().where("done", false).sort({ id: -1 }).exec();
}
export async function getOrderProducts(id: number) {
    return Product.find().where("id", id).exec();
}

export async function initDB() {
    await mongoose.connect("mongodb://localhost:27017/puntoristoro")
    initialized = true;

    Order = mongoose.model<IOrder>("order", orderSchema);
    Product = mongoose.model<IProduct>("product", productSchema);

    id = await Order.find({}).sort({ id: -1 }).limit(1).then(orders => {
        if (orders.length <= 0) {
            return 0;
        }
        return orders[0].id;
    });
    console.log(id)
}