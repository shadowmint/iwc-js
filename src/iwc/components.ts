import cmp = require('./component');
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
     * Inject the content into the given root node and return the new root node.
     * This operation is invoked async.
     */
    injectContent(root:any, content:any, done:{(root:any):void}):void;

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
    private _factory:cmp.Factory[] = [];

    /** Keep a list of all component instances here */
    private _instances:cmp.Component[] = [];

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
            if ((root.factory) && (root.node)) {
                var instance = root.factory.factory();
                instance.root = root.node;
                instance.data = this._data(this._impl.collectData(root.node));
                instance.factory = root.factory;
                this._instances.push(instance);
                var content = instance.content ? instance.content() : null;
                this._impl.injectContent(root.node, content, (root) => {
                    if (instance.init) {
                      instance.init();
                    }
                    loaded({ node: root, factory: null });
                });
            }
            else {
                loaded(null);
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

    /** Parse data values and combine them */
    private _data(data:any):any {
        var rtn = {};
        var all = [];
        for (var key in data) {
          var name = key.split('data-').length == 2 ? key.split('data-')[1] : null;
          if (name) {
            var items = data[key];
            for (var i = 0; i < items.length; ++i) {
              if (!all[i]) { all[i] = {}; } var __all = all[i];
              if (!rtn[name]) { rtn[name] = []; }
              rtn[name].push(items[i]);
              __all[name] = items[i];
            }
          }
        }
        rtn['_all'] = all;
        return rtn;
    }

    /** Add a component type */
    public add(factory:cmp.Factory):void {
        if (this._indexOf(factory, this._factory) == -1) {
            this._factory.push(factory);
            if (factory.stylesheet) {
                this._impl.injectStyles(factory.stylesheet);
            }
        }
    }

    /** Remove a component type */
    public drop(factory:cmp.Factory):void {
      var index = this._indexOf(factory, this._factory);
      if (index != -1) {
        this._factory.splice(index, 1);
      }
    }

    /** Prune existing component instances */
    public prune():void {
      var instances = [];
      for (var i = 0; i < this._instances.length; ++i) {
        try {
          if (this._instances[i]['valid']) {
            var valid = this._instances[i]['valid']() === true;
          }
          else {
            var valid = !this._impl.shouldPrune(this._instances[i].root);
          }
        }
        catch(e) {
          valid = false;
        }
        if (!valid) {
          if (this._instances[i]['drop']) {
            try {
              this._instances[i]['drop']();
            }
            catch(e) {
            }
          }
        }
        else {
          instances.push(this._instances[i]);
        }
      }
      this._instances = instances;
    }

    /** Query an element by root value */
    public query(root:any):any {
      var rtn:cmp.Component = null;
      if (root.length) { root = root[0]; } // Support jquery
      for (var i = 0; i < this._instances.length; ++i) {
        if (this._impl.equivRoot(root, this._instances[i].root)) {
          rtn = this._instances[i]['api'] ? this._instances[i].api() : this._instances[i];
          break;
        }
      }
      return rtn;
    }
}
