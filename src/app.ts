import express from "express";
import path from "path";
import config from "config"
import api from "./api-routes.ts"
import { initDB } from "./db.ts"
import { WebSocketServer } from "ws" 
import handleWebSocketMsg from "./ws-api.ts";

let app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || (config.has("server.port") ? config.get("server.port") : 3000);

let viewsDir = path.join(process.cwd(), "views");
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.static(path.join(process.cwd(), "public/typescript")));

let server = app.listen(PORT, () => {console.log(`listening on port ${PORT}`);})

initDB(); 

const wss = new WebSocketServer({server});

wss.on("connection", (ws) => {
    ws.on("error", console.error)

    ws.on("message", (data) => {
        handleWebSocketMsg(data, ws, wss);
    })
})

app.get("/", (req, res) => {
    res.sendFile(path.join(viewsDir, "index.html"));
})

app.get("/postazione/:tipo", (req, res) => {
    res.sendFile(path.join(viewsDir, "station.html"))
})

app.use("/api", api);

app.get("/products", (req, res) => {
    
    res.status(200).send(config.get("products"))
}) 

