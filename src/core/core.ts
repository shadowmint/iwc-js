/// <reference path="../../dist/xq/index.d.ts"/>
import xq = require('xq/xq');
module model {
    export interface Person {
        name:String;
        stuff:Number;
    }
}

module api {
    export var Person = new xq.Base<model.Person>({
        table: 'person',
        fields: {
            name: String,
            stuff: Number
        }
    });
}


xq.connect("sqlite://data.sqlite").then((db) => {
    return api.Person.sync(db);
}).then(() => {
    return api.Person.create({
        name: 'doug',
        stuff: 1
    });
}).then(() => {
    return api.Person.find({});
}).then((items) => {
    console.log('items: ' + items.length);
    return api.Person.exists({
        name: 'doug'
    });
}).then((exists) => {
    console.log('exists "doug": ' + exists);
    return api.Person.remove({
        name: 'doug'
    });
}).then((items) => {
    return api.Person.exists({
        name: 'doug'
    });
}).then((exists) => {
    console.log('exists "doug": ' + exists);
    return api.Person.remove({
        name: 'doug'
    });
}).then(() => {
    return api.Person.count({});
}).then((results) => {
    console.log('final: ' + results);
    console.log('completed test run');
});
