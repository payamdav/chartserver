import {chartObjects, ChartObject, Elements, getChartObjectById} from "../chartObject/chartObject.mjs"


export let methods = {};

methods.time = () => {return Date.now();};
methods.asyncTime = async function () {return Date.now();};

methods.createChart = (p) => {return new ChartObject(p).id;};
methods.removeChart = (id) => {let c = getChartObjectById(id); return c ? c.remove() : false; };
methods.getChart = (id) => {let c = getChartObjectById(id); return c ? c : null; };
