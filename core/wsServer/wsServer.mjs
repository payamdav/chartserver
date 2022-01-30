import {config} from "../../config.mjs"
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';
import {v4 as uuid} from "uuid"
import {events} from "../base/events.mjs"
import {methods} from "./rpcMethods.mjs"

let clients = new Map();
const pingTimeout = 60000;
let rpcReplyMap = new Map();

const server = createServer({
    cert: readFileSync('./ssl/ssl.crt'),
    key: readFileSync('./ssl/ssl.key')
});

export function startWebSocketServer () {
    webSocketServer();
    server.listen(Number(config.webSocketPort));
}

function webSocketServer () {
    deadClientCloser();
    const wss = new WebSocketServer({ server });
    wss.on('connection', function connection(ws, req) {
        let sourceIp = req.socket.remoteAddress;
        let urlPath = req.url;
        let id = uuid();
        clients.set(id, {
            id,
            ip: sourceIp,
            url: urlPath,
            ws,
            rooms: ['broadcast'],
            connectionTs: Date.now(),
            lastPing: Date.now()
        });
        if (urlPath !== `/${config.wsSecretToken}`) {
            // bad token
            console.log(`new Connection from ${sourceIp} - REJECTED`);
            ws.close();
        }
        else {
            console.log(`new Connection from ${sourceIp} - Accepted`);
            // ws.send(JSON.stringify('welcome'));
        }

        ws.on('message', (data) => {
            try {
                let m = JSON.parse(data);
                messageHandler(m, id);
            } catch (err) {
                console.log(`Error:Websocket:Message:${id} `, err.message, data);
            }
        });

        ws.on('close', function () {
            console.log(`Connection from ${sourceIp} - Closed`);
            clients.delete(id);
        });

    });

    wss.on("error", function (err) {
       console.log(err);
    });

}


function messageHandler (m, id) {

    if (m.hasOwnProperty("type") && m.type) {
        if (m.type === 'ping') pingHandler(m, id);
        else if (m.type === 'subscribe') subscribeHandler(m, id);
        else if (m.type === 'unsubscribe') unsubscribeHandler(m, id);
        else if (m.type === 'event') events.emit(m.event, m);
        else if (m.type === 'rpc') rpcHandler(m, id);
        else if (m.type === 'rpcReply') rpcReplyHandler(m, id);

        else console.log(`Received Unhandled Message Type from: ${id}`);
    }
    else {
        console.log(`received RAW message from ${id}`, m);
    }
}

function pingHandler(m, id) {
    let client = clients.get(id);
    if (client) {
        client.lastPing = Date.now();
    }
}

function deadClientCloser () {
    let current = Date.now();
    for (let [id, client] of clients) {
        if (current - client.lastPing > pingTimeout) {
            console.log(`Client ${id} PING TIMEOUT`);
            client.ws.close();
        }
        else {
            // ping
            client.ws.send(JSON.stringify({
                type: "ping",
                ts: current
            }));

        }
    }

    setTimeout(deadClientCloser, 10000);
}

function subscribeHandler (m, id) {
    let client = clients.get(id);
    if (client) {
        if (m.room && !client.rooms.includes(m.room)) {
            client.rooms.push(m.room);
            // clients.set(id, client);
        }
    }
}

function unsubscribeHandler (m, id) {
    let client = clients.get(id);
    if (client) {
        if (m.room) {
            client.rooms = client.rooms.filter(e => e !== m.room);
            // clients.set(id, client);
        }
    }
}

function sendToClient(m, id) {
    try {
        let client = clients.get(id);
        if (client && client.ws.readyState === 1) client.ws.send(JSON.stringify(m));
    } catch (err) {
        console.log(err);
    }
}

function sendToRoom(m, room) {
    if (!Array.isArray(room)) room = [room];
    try {
        for (let [id, client] of clients) {
            let intersect = client.rooms.filter(value => room.includes(value));
            if (intersect.length > 0) sendToClient(m, id);
        }
    } catch (err) {
        console.log(err);
    }
}

export function wsEmit(event, data, room = "broadcast") {
    if (!data) data = {};
    let m = {
        type: "event",
        event,
        data,
    };
    sendToRoom(m, room);
}

export function wsRpc(method, data, callback, room) {
    if (!data) data = [];
    if (!Array.isArray(data)) data = [data];
    let id = uuid();
    rpcReplyMap.set(id, {callback, ts: Date.now()});
    let m = {
        id,
        type: "rpc",
        method,
        data,
    };
    sendToRoom(m, room);
}

function rpcReplyHandler (m, id) {
    let r = rpcReplyMap.get(m.id);
    if (r) {
        setTimeout(()=>{r.callback(m.reply);}, 0);
    }

    // remove expired
    for (const [id, rr] of rpcReplyMap) {
        if (Date.now() - rr.ts > 120000) {
            rpcReplyMap.delete(id);
        }
    }
}

function rpcHandler (m, id) {
    let met = methods[m.method];
    if (met && met.constructor.name === 'AsyncFunction') {
        met(...m.data).then((reply) => { rpcReply(m, id, reply); })
    }
    else if (met) {
        let reply = met(...m.data);
        rpcReply(m, id, reply);
    }
}

function rpcReply(mIn, id, reply) {
    let m = {
        type: "rpcReply",
        id: mIn.id,
        reply
    };
    sendToClient(m, id);
}

function test () {
    // sendToRoom("Salam from test", 'binance');
    // wsEmit("hello", {a:1 });
    // wsRpc("asyncTime", {a: 1234}, (r)=>{console.log(r)}, "binance");
    // setTimeout(test, 10000);
}
