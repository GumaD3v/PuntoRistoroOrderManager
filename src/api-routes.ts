import express from "express";
import { CreateOrder, IOrder, IProduct, createOrder, getAllOrders, getOrderProducts, getToDoOrders } from "./db";

let router = express.Router();

router.post("/create-order", async (req, res) => {
    let created = -1;
    let order: CreateOrder = {
        products: new Map(Object.entries(req.body.products)),
        done: false
    }
    created = await createOrder(order);
    if (created != -1) {
        res.status(200).send("Ok")
        return;
    }
    res.status(418).send("Couldn't create order... maybe i'm a teapot!")
})

router.get("/orders/all", async (req, res) => {
    let orders = (await getAllOrders()) as Array<IOrder>
    res.status(200).send(orders)
})

router.get("/orders/todo", async (req, res) => {
    let orders = (await getToDoOrders()) as Array<IOrder>
    res.status(200).send(orders)
})

router.get("/order/:id/products", async (req, res) => {
    let products = (await getOrderProducts(Number(req.params.id))) as Array<IProduct>
    res.status(200).send(products)
})

export default router;