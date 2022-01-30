import {config} from "../../config.mjs"
import {wait} from "../libs/asyncWait.js"
import {MongoClient} from "mongodb"

export let client = new MongoClient(config.MONGODB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

let db;

export async function createConnection () {
    try {
        await client.connect();
        // db = await client.db(config.MONGODB_DB);
        console.log("MONGODB:CONNECTED" );
    } catch (err) {
        console.log("ERROR:MONGODB:CONNECT: ", err.message);
    }
}

export async function getConnection () {
    while (!db) {
        await wait(200);
    }
    return db;
}
