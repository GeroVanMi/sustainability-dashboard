// import * as Logger from "./Logger.mjs";

let anchor; 
    
const events = [
    "queryUpdate", // a query has changed 
    "queryExtra",
    "dataUpdate", // new data is available
    "moreData", // ask for more data
    "statUpdate", // new data is available
    "statMainUpdate", 
    "statPeopleUpdate",
    "personUpdate",
    "queryAddItem",
    "queryError",
    "queryClear",
    "queryDrop",
    "queryReplace",
    "partialMatchingTerm",
    "fullMatchingTerm",
    "invalidMatchingTerm",
    "indexTermDelete",
    "indexTermCreate",
    "indexTermUpdate",
    "indexTermData",
    "bookmarkDelete",
    "bookmarkCreate",
    "bookmarkUpdate",
    "bookmarkData",
    "changeCategory"
];

export const trigger = events.reduce((a, e) => {
        a[e] = (detail) => anchor ? anchor.dispatchEvent(new CustomEvent(e, {detail})) : null;
        return a;
    }, {});

const preListeners = [];

export const listen = events.reduce((a, event) => { 
        a[event] = (func) => anchor ? anchor.addEventListener(event, func) : preListeners.push({event, func});
        return a;
    }, {});

export function init(evAnchor) {
    anchor = evAnchor;

    preListeners.forEach((li) => anchor.addEventListener(li.event, li.func));
}
