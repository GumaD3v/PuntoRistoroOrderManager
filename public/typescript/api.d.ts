export interface IOrder {
    id: number;
    orderTime: Date;
    done: boolean;
}
export declare enum State {
    Preparing = 0,
    ToDeliver = 1,
    Delivered = 2
}
export interface IProduct {
    id: number;
    name: string;
    state: State;
    amount: number;
}
export declare function createOrder(products: Map<String, number>, done: boolean): Promise<void>;
