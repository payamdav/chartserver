import {v4 as uuid} from "uuid"

export let chartObjects = {};

export function getChartObjectById (id) {
    if (chartObjects.hasOwnProperty(id)) return chartObjects[id];
    return null;
}

export class ChartObject {
    constructor({title="Chart", engine="lightweight", w= 320, h=200}={}) {
        this.id = uuid();
        this.save();
        this.title = title;
        this.engine = engine;
        this.w = w;
        this.h = h;
        this.elements = [];

    }

    save () {
        chartObjects[this.id] = this;
    }

    remove () {
        delete chartObjects[this.id];
        return true;
    }

    addElement(elem) {
        this.elements.push(elem);
    }

    removeElement(elem) {
        if (typeof elem === "object" && elem.hasOwnProperty("id")) {
            this.elements = this.elements.filter(e => e.id !== elem.id);
        }
        else {
            this.elements = this.elements.filter(e => e.id !== elem);
            this.elements = this.elements.filter(e => e.name !== elem);
        }
    }


}


export class Elements {
    constructor({type, source="data", data=[], name=""}={}) {
        this.id = uuid();
        this.type = type;
        this.source = source;
        this.data = data;
        this.name = name;
    }
}

