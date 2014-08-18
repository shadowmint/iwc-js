import actions = require('./internal/actions');
import cmp = require('./internal/component')
export module iwc {

    /** Register a new component */
    export function component(data:cmp.ComponentDef):void {
        var named = actions.validate_name(data.name);
        var component = <cmp.Component> data;
        component.name = named.name;
        component.namespace = named.namespace;
        component.instances = {};
        component.loaded = false;
        component.next_id = 1;
        actions.register_component(component);
    }

    /**
     * Load all components all over again.
     * If the root element is supplied, the component should only
     * look through any child elements of that target for new
     * components to load. By default the document is passed.
     * @param root Root node to search if any.
     */
    export function load(root:Node = null):void {
        actions.load_components(root);
    }

    /** Interface base */
    export interface Data {
        styles:string;
        markup:string;
        resources:any;
    }

    /** Optional common helper base for IWC instances */
    export class Base {

        /** Name */
        public name:string;

        /** Internal data values */
        public _data:Data;

        /** Create a component with a given name */
        constructor(name:string, data:Data) {
            this.name = name;
            this._data = data;
        }

        /** Return api */
        public api():any {
          return {};
        }

        /** Return elements */
        public targets(root:Node):HTMLElement[] {
            return [];
        }

        /** Return the new dom node content */
        public template(data:any):string {
            return this._data.markup;
        }

        /** Return the model for this component */
        public model():any {
            return {};
        }

        /** Return the view for this component */
        public view():any {
            return {};
        }

        /** Return a state for the component */
        public state(ref:cmp.Ref):any[] {
            return [];
        }

        /** Update the component state from the model */
        public update(ref:cmp.Ref):void {
        }

        /** Run this on instances once the dom is updated */
        public instance(ref:cmp.Ref):void {
        }

        /** Run this on instances before the dom is updated */
        public preload(ref:cmp.Ref):void {
        }

        /** Agregate the data in a reference */
        public agregate(data:any) {
          var rtn = [];
          for (var key in data) {
            var bit = key.split('-')[1];
            for (var i = 0; i < data[key].length; ++i) {
              if (!rtn[i]) { rtn.push({}); }
              rtn[i][bit] = data[key][i];
            }
          }
          return rtn;
        }

        /** Export a definition for this instance */
        public def():cmp.ComponentDef {
            return {
                name: this.name,
                model: this.model(),
                view: this.view(),
                styles: this._data.styles,
                api: ():any => {
                    return this.api();
                },
                targets: (root):HTMLElement[] => {
                    return this.targets(root);
                },
                template: (data:any) => {
                    return this.template(data);
                },
                instance: (ref:cmp.Ref) => {
                    this.instance(ref);
                },
                preload: (ref:cmp.Ref) => {
                    this.preload(ref);
                },
                state: (ref:cmp.Ref) => {
                    return this.state(ref);
                },
                update: (ref:cmp.Ref) => {
                    this.update(ref);
                }
            };
        }
    }
}

// Export module for AMD in browserify
declare var define:any;
try {
    define('iwc', function () {
        return iwc;
    });
}
catch (e) {
}
