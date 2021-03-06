import async = require("./async");

/** Helper to process recursive chains */
export class Actions {

    /** Stack of root nodes */
    roots:any[];

    /** Some callback to invoke once all the roots are loaded */
    complete:any;

    /** Process a single item */
    item:{(root:any, loaded:{(root:any):void}):void} = null;

    /** Process an item and generate some new items */
    items:{(root:any):any[]}

    constructor() {
        this.roots = [];
        this.complete = null;
    }

    /** Push a new root node into this chain */
    public push(root:any) {
        this.roots.push(root);
    }

    /**
     * Process the next root node and then invoke next.
     * @param items A callback to take a root node and spit out a set of items.
     * @param item A callback to load a single item and then invoke the callback with a new root node.
     */
    public process():void {
        if (this.roots.length) {
            var root = this.roots.pop();
            var found = this.items(root);
            if (found.length == 0) {
                this.process();
            }
            else {
                var waiting = found.length;
                var maybe_done = () => {
                    waiting -= 1;
                    if (waiting <= 0) {
                        this.process();
                    }
                };
                for (var i = 0; i < found.length; ++i) {
                    this.item(found[i], (root) => {
                        if (root != null) {
                          this.roots.push(root);
                        }
                        maybe_done();
                    });
                }
            }
        }
        else if (this.complete) {
            this.complete();
        }
    }

    /** Process all root nodes and then invoke the callback */
    public all(complete:{():void}) {
        this.complete = complete;
        this.process();
    }
}
