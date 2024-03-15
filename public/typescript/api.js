var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var State;
(function (State) {
    State[State["Preparing"] = 0] = "Preparing";
    State[State["ToDeliver"] = 1] = "ToDeliver";
    State[State["Delivered"] = 2] = "Delivered";
})(State || (State = {}));
export function createOrder(products, done) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetch("http://" + window.location.host + "/api/create-order", {
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
    });
}
