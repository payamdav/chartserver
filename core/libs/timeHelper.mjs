
export function timeDeltaString (ts) {
    let current = Date.now();
    let delta = current - ts;
    let deltaOriginal = delta;
    let days = Math.floor(delta / 86400000);
    delta = delta - (days * 86400000);
    let hours = Math.floor(delta / 3600000);
    delta = delta - (hours * 3600000);
    let mins = Math.floor(delta / 60000);
    delta = delta - (mins * 60000);
    let secs = Math.floor(delta / 1000);

    let t = "";
    if (deltaOriginal < 1000) {
        t = 'now';
    }
    else if (deltaOriginal < 60000) {
        t = `${secs}s`;
    }
    else if (deltaOriginal < 3600000) {
        t = `${mins}m ${secs}s`;
    }
    else if (deltaOriginal < 86400000) {
        t = `${hours}h ${mins}m`;
    }
    else {
        t = `${days}d ${hours}h`;
    }

    return t;

}

export function timeString (ts) {
    let d = new Date(ts);
    let hour = d.getHours();
    let min = d.getMinutes();
    let t = `${hour}:${min}`;
    return t;
}

export function nowTimeString () {
    let d = new Date();
    let hour = d.getHours();
    let min = d.getMinutes();
    let sec = d.getSeconds();
    let t = `${hour}:${min}:${sec}`;
    return t;
}

export function dateTimeString (ts) {
    let d = new Date(ts);
    let y = d.getFullYear();
    let m = d.getMonth() + 1;
    let day = d.getDate();
    let hour = d.getHours();
    let min = d.getMinutes();
    let second = d.getSeconds();
    let t = `${y}/${m}/${day} - ${hour}:${min}:${second}`;
    return t;
}
