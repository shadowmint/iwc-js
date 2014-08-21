import iwc = require('./iwc');
import actions = require('./utils/action_chain');
import async = require('./utils/async');
declare var document;

/** Component implementation bindings */
export interface ComponentsImpl {

    /** Should the component with the given dom node be pruned */
    shouldPrune(root:any):boolean;

    /** Inject the given string (if any) into the DOM as a stylesheet */
    injectStyles(styles:string):void;

    /**
     * Collect all the data attributes from some root node
     * The result should be: { 'data-key': [...], 'data-foo': [...] }
     */
    collectData(root:any):any;

    /**
     * Inject the content into the given root node
     * This operation is invoked async.
     */
    injectContent(root:any, content:any):void;

    /**
     * Compare two root nodes for equivalence.
     * NB. Specifically for dom nodes document.getElementById('foo') != document.getElementById('foo')
     */
    equivRoot(r1:any, r2:any):boolean;
}

/** Component registry */
export class Components {

    /** The implementation binding for this instance */
    private _impl:ComponentsImpl;

    /** Keep a list of all component factory instances here */
    private _factory:iwc.iwc.Factory[] = [];

    /** Keep a list of all component instances here */
    private _instances:iwc.iwc.Component[] = [];

    constructor(impl:ComponentsImpl) {
        this._impl = impl;
    }

    /** Cross browser index of */
    private _indexOf(needle:any, haystack:any) {
        var index = -1;
        for (var i = 0; i < haystack.length; ++i) {
            if (haystack[i] == needle) {
                index = i;
                break;
            }
        }
        return index;
    }

    /** Load any component instances */
    public load(root:any = null, done:any = null):void {
        var action = new actions.Actions();
        action.push({ node: root , factory: null });
        action.items = (root:any):any[] => {
            console.log("The root passed to items was: " + JSON.stringify(root));
            console.log("We have " + this._factory.length + " factories to look at");
            var rtn:any[] = [];
            for (var i = 0; i < this._factory.length; ++i) {
                var list = this._factory[i].query(root.node);
                for (var j = 0; j < list.length; ++j) {
                    rtn.push({ node: list[j], factory: this._factory[i] });
                }
            }
            return rtn;
        };
        action.item = (root:any, loaded:{(root:any):void}) => {
            if (root.factory) {
                var instance = root.factory.factory();
                instance.root = root.node;
                instance.data = this._impl.collectData(root.node);
                instance.factory = root.factory;
                this._instances.push(instance);
                this._impl.injectContent(root.node, instance.content());
                async.async(() => {
                    console.log("After inject, the result was: " + JSON.stringify(root));
                    loaded(root);
                });
            }
            else {
                loaded(root);
            }
        };
        action.all(done);
    }

    /** Check if the given root already exists on some component */
    private _exists(root:any):boolean {
        for (var i = 0; i < this._instances.length; ++i) {
            if (this._impl.equivRoot(this._instances[i].root, root)) {
                return true;
            }
        }
        return false;
    }

    /** Add a component type */
    public add(factory:iwc.iwc.Factory):void {
        if (this._indexOf(factory, this._factory) == -1) {
            this._factory.push(factory);
            if (factory.stylesheet) {
                this._impl.injectStyles(factory.stylesheet);
            }
        }
    }

    /** Remove a component type */
    public drop(factory:iwc.iwc.Factory):void {
        var index = this._indexOf(factory, this._factory);
        console.log("Found index for value: " + this._indexOf(factory, this._factory));
        if (index != -1) {
            console.log("Drop");
            this._factory.splice(index, 1);
            console.log(this._factory);
        }
    }

    /** Prune existing component instances */
    public prune():void {
        var instances = [];
        for (var i = 0; i < this._instances.length; ++i) {
            if ((this._instances[i]['valid'] && (this._instances[i]['valid']() === true)) ||
                (this._impl.shouldPrune(this._instances[i].root)))
            {
                this._instances[i].drop();
            }
            else {
                instances.push(this._instances[i]);
            }
        }
        this._instances = instances;
    }
}
