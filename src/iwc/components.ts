import cmp = require('./component');
import actions = require('./utils/action_chain');
import errors = require('./utils/errors');
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
    injectContent(root:any, content:any, factory:any, done:{(root:any):void}):void;

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

    /** A temporary node list */
    private _processed:any[];

    constructor(impl:ComponentsImpl) {
        this._impl = impl;
    }

    /** Cross browser index of */
    private _indexOf(needle:any, haystack:any, cmp:any = null) {
        var index = -1;
        for (var i = 0; i < haystack.length; ++i) {
            if (cmp) {
              if (cmp(haystack[i], needle)) {
                  index = i;
                  break;
              }
            }
            else {
              if (haystack[i] == needle) {
                  index = i;
                  break;
              }
            }
        }
        return index;
    }

    /** Load any component instances */
    public load(root:any = null, done:any = null):void {
      //console.log("Loading starts..............\n\n");
      this._processed = [];
      this._load(root, done);
    }

    /** Load any component instances */
    private _load(root:any = null, done:any = null):void {
        //console.log("Stepped into load");
        var count = 0;
        var action = new actions.Actions();
        var cmp = (a, b) => { return this._impl.equivRoot(a.node, b.node); };
        action.push({node: root, factory: null});
        action.items = (root:any):any[] => {
            //console.log("-------------------------- Looking at node ---------------------------");
            //console.log(root);
            var rtn:any[] = [];
            if (this._indexOf(root, this._processed, cmp) == -1) {
              this._processed.push(root);
              for (var i = 0; i < this._factory.length; ++i) {
                  try {
                      var list = this._factory[i].query(root.node);
                  }
                  catch(e) {
                      errors.raise('Failed to query() component root elements on factory', e);
                  }
                  for (var j = 0; j < list.length; ++j) {
                      if (!this._exists(list[j])) {
                          rtn.push({node: list[j], factory: this._factory[i]});
                          //console.log("Turning root node into component!");
                          //console.log(this._factory[i]);
                      }
                  }
              }
            }
            return rtn;
        };
        action.item = (root:any, loaded:{(root:any):void}) => {
            count += 1;
            if ((root.factory) && (root.node)) {
                try {
                    var instance = root.factory.factory();
                }
                catch(e) {
                    errors.raise('Failed to create component instance from factory()', e);
                }
                instance.root = root.node;
                instance.data = this._data(this._impl.collectData(root.node));
                instance.factory = root.factory;
                this._instances.push(instance);
                try {
                    var content = instance.content ? instance.content() : null;
                }
                catch (e) {
                    errors.raise('Failed to run component content()', e);
                }
                this._impl.injectContent(root.node, content, instance, (root) => {
                    if (instance.init) {
                        try {
                            instance.init();
                        }
                        catch (e) {
                            errors.raise('Failed to run component init()', e);
                        }
                    }
                    //console.log("Pushing new child node for query");
                    //console.log(root);
                    async.async(() => { loaded({node: root, factory: null}); });
                });
            }
            else {
                loaded(null);
            }
        };
        action.all(() => {
          if (count == 0) {
            if (done != null) {
              done();
            }
          }
          else { async.async(() => { this._load(root, done); })}
        });
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
                    if (!all[i]) {
                        all[i] = {};
                    }
                    var __all = all[i];
                    if (!rtn[name]) {
                        rtn[name] = [];
                    }
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
                var valid = true;
                if (this._instances[i]['valid']) {
                    try {
                        valid = this._instances[i]['valid']() === true;
                    }
                    catch (e) {
                        errors.raise('Failed to run component valid()', e);
                    }
                }
                valid = valid ? !this._impl.shouldPrune(this._instances[i].root) : false;
            }
            catch (e) {
                valid = false;
            }
            if (!valid) {
                if (this._instances[i]['drop']) {
                    try {
                        this._instances[i]['drop']();
                    }
                    catch (e) {
                        errors.raise('Failed to run component drop()', e);
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
        if (root.length) {
            root = root[0];
        } // Support jquery
        for (var i = 0; i < this._instances.length; ++i) {
            if (this._impl.equivRoot(root, this._instances[i].root)) {
                try {
                    rtn = this._instances[i]['api'] ? this._instances[i].api() : this._instances[i];
                }
                catch(e) {
                    errors.raise('Failed to run component api()');
                }
                break;
            }
        }
        return rtn;
    }
}
