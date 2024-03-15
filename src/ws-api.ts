import { RawData, WebSocketServer, WebSocket } from "ws";
import * as db from "./db"
import { IOrder, IProduct } from "./db";
import { connected } from "process";

type WebSocketMsg = {
    type: string,
    data: Object
}

export default async function handleWebSocketMsg(data: RawData, ws: WebSocket, wss: WebSocketServer) {
    let msg = JSON.parse(data.toString())
    if (msg as WebSocketMsg) {
        switch (msg.type) {
            case "GetOrdersToDo": {
                let orders = (await db.getToDoOrders()) as Array<IOrder>;
                let response = {
                    "type": "GetOrdersResp",
                    "data": orders
                }
                ws.send(JSON.stringify(response)) 
                break;
            }
            case "GetAllOrders": {
                let orders = (await db.getAllOrders()) as Array<IOrder>;
                let response = {
                    "type": "GetOrdersResp",
                    "data": orders
                }
                ws.send(JSON.stringify(response)) 
                break;
            }
            case "GetProductsOfOrder": {
                console.log(msg.data)
                let products = (await db.getOrderProducts(msg.data.id)) as Array<IProduct>;
                let response = {
                    "type": "GetProductsResp",
                    "data": {id: msg.data.id, products}
                }
                ws.send(JSON.stringify(response)) 
                break;
            }
            case "CreateOrder": {
                let order: db.CreateOrder = {
                    products: new Map(Object.entries(msg.data)),
                    done: false
                }
                console.log(order)
                let id: number = await db.createOrder(order);
                if (id != -1) {
                    ws.send(JSON.stringify({"type": "OrderCreated", "data": {}}))
                    
                    let orderData = JSON.stringify({
                        "type": "CreateOrder",
                        "data": {
                            "products": msg.data,
                            "id": id
                        }
                    })
                    wss.clients.forEach((client) => {
                        client.send(orderData)
                    })
                }
                else {
                    ws.send(JSON.stringify({"type": "CreateOrderError", "data": {}}))
                }
                break;
            }

        }
    }
    else {
        console.log("Invalid WS request!")
        return
    }
}