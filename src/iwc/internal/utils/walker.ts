/** Walk through the DOM and touch each node */
export class Walk {

    /** Element root */
    public root:HTMLElement;

    /** Set of loaded data attribute */
    public attribs:any;

    public constructor(root:HTMLElement) {
        this.root = root;
    }

    /** Walk the DOM and collect all data attributes */
    public walk():Walk {
        this.attribs = {};
        this.each((n:Node) => { this.data(n); });
        for (var key in this.attribs) {
            if (this.attribs[key].length == 1) {
                this.attribs[key] = this.attribs[key][0];
            }
        }
        return this;
    }

    /** Invoke a callback for each DOM node */
    public each(callback:{(node:Node):void}):void {
        var stack:Node[] = [this.root];
        while (stack.length != 0) {
            var n = stack.shift();
            callback(n);
            for (var i = 0; i < n.childNodes.length; ++i) {
                stack.push(n.childNodes[i]);
            }
        }
    }

    /** Get a list of data attributes from a node */
    public data(node:Node):any[] {
        var rtn:any[] = [];
        if (node.attributes) {
            var a = [].filter.call(node.attributes, function(at) { return /^data-/.test(at.name); });
            for (var i = 0; i < a.length; ++i) {
                var name = a[i].name;
                var value = a[i].value;
                if (!this.attribs[name]) {
                    this.attribs[name] = [];
                }
                this.attribs[name].push(value);
            }
        }
        return rtn;
    }
}
