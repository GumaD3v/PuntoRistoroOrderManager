export declare let sellable_products: Map<string, number>;
declare class Cart extends Map<string, number> {
    removeItem(item: string): void;
    set(prop: string, value: number): this;
    sendOrder(ws: WebSocket): void;
}
declare let cart: Cart;
export default cart;
