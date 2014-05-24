/// <reference path="./defs/orm/orm.d.ts"/>
/// <reference path="./defs/q/Q.d.ts"/>
import orm = require('orm');
import Q = require('q');

/* Base class for interacting with the database */
export class Base<T> {
    private _def:Def;
    private _orm:any = null;

    constructor(def:Def) {
        this._def = def;
    }

    /* Check if we're ready yet */
    private _ready():void {
        if (!this._orm) {
            throw new Error('Must invoke sync() before any other DB operations');
        }
    }

    /* Initialize the factory with a DB instance */
    public sync(db:any):Q.Promise<any> {
        var def = Q.defer<any>();
        this._orm = db.define(this._def.table, this._def.fields);
        this._orm.sync((err) => {
            if (err) {
                def.reject(err);
            }
            else {
                def.resolve(true);
            }
        })
        return def.promise;
    }

    /* Add a new instance to the store */
    public create(template:T):Q.Promise<any> {
        this._ready();
        var def = Q.defer();
        this._orm.create(template, (err, results) => {
            if (err) {
                def.reject(err);
            }
            else {
                def.resolve(results);
            }
        });
        return def.promise;
    }

    /* Find items by attribute */
    // TODO: options, etc. --> Model.find([ conditions ] [, options ] [, limit ] [, order ] [, cb ])
    public find(query:any):Q.Promise<orm.Instance[]> {
        this._ready();
        var def = Q.defer<orm.Instance[]>();
        this._orm.find(query, (err, results:orm.Instance[]) => {
            if (err) {
                def.reject(err);
            }
            else {
                def.resolve(results);
            }
        });
        return def.promise;
    }

    /* Count items found by attribute */
    public count(query:any):Q.Promise<number> {
        this._ready();
        var def = Q.defer<number>();
        this._orm.count(query, (err, results) => {
            if (err) {
                def.reject(err);
            }
            else {
                def.resolve(results);
            }
        });
        return def.promise;
    }

    /* Delete object */
    public remove(query:any):Q.Promise<boolean> {
        this._ready();
        var def = Q.defer<boolean>();
        this._orm.find(query).remove((err) => {
            if (err) {
                def.reject(err);
            }
            else {
                def.resolve(true);
            }
        });
        return def.promise;
    }

    /* Check and object with the given attributes exists */
    public exists(query:any):Q.Promise<boolean> {
        this._ready();
        var def = Q.defer<boolean>();
        this._orm.exists(query, (err, exists:boolean) => {
            if (err) {
                def.reject(err);
            }
            else {
                def.resolve(exists);
            }
        });
        return def.promise;
    }

    // TODO: Person.get(123, function (err, person) {
}

export interface Def {
    table:string;
    fields:{[key:string]:any
    };
}

export function connect(uri:string):Q.Promise<orm.ORM> {
    var def = Q.defer<orm.ORM>();
    orm.connect(uri, function (err, db) {
        if (err) {
            def.reject(err);
        }
        def.resolve(db);
    });
    return def.promise;
}
