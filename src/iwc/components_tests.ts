import c = require('./components');
import iwc = require('./iwc');

// test impl
class TestImpl implements c.ComponentsImpl {

    public stylesheets:number = 0;
    public instances:number = 0;
    public inits:number = 0;
    public injected:number = 0;
    public drops:number = 0;
    public data:any = null;

    shouldPrune(root:any):boolean {
        return true;
    }

    injectStyles(styles:string):void {
        if (styles) {
            this.stylesheets += 1;
        }
    }

    collectData(root:any):any {
        return this.data;
    }

    injectContent(root:any, content:any):void {
        if (content) {
            this.injected += 1;
            root.value = content;
        }
        else {
          root.value = '';
        }
    }

    equivRoot(r1:any, r2:any):boolean {
        return r1 === r2;
    }
}

// test component type
class Cmp extends iwc.iwc.Base {

    is_valid:any = null;
    inner:string = null;
    impl:TestImpl;

    constructor(impl:TestImpl) {
        super()
        this.impl = impl
    }

    init() {
        this.impl.inits += 1;
    }

    content():any {
        return this.inner;
    }

    valid():boolean {
        return <boolean> this.is_valid;
    }

    drop() {
        this.impl.drops += 1;
    }
}

// test component factory
class Factory implements iwc.iwc.Factory {

    roots:any[];
    stylesheet:string;
    impl:TestImpl;
    id:string = null;

    public static content_map:any = {};

    constructor(impl:TestImpl, stylesheet:any = null, roots:any[] = []) {
        this.impl = impl;
        this.roots = roots;
        this.stylesheet = stylesheet;
    }

    public factory():iwc.iwc.Component {
        var cmp = new Cmp(this.impl);
        if (this.id != null) {
            cmp.inner = Factory.content_map[this.id];
        }
        this.impl.instances += 1;
        return cmp;
    }

    public query(root:any):any[] {
        if ((root.value != null) && (this.id != null)) {
            var items = (<string> root.value).split('');
            var rtn = [];
            for (var i = 0; i < items.length; ++i) {
                if (items[i] == this.id) {
                    rtn.push({value: items[i]});
                }
            }
            return rtn;
        }
        var r = this.roots;
        this.roots = [];
        return r;
    }
}

// generate a test instance
function tmp() {
    var impl = new TestImpl();
    var factory = new Factory(impl);
    var components = new c.Components(impl);
    return { impl: impl, factory: factory, components: components };
}

// generate a test component group
function tmp_group() {
    var impl = new TestImpl();
    var components = new c.Components(impl);
    var rtn = { impl: impl, factory: [], components: components };
    for (var i = 0; i < 10; ++i) {
        rtn.factory.push(new Factory(impl));
        rtn.factory[i].id = i;
        rtn.components.add(rtn.factory[i]);
    }
    return rtn;
}

export function test_create(t) {
    var i = tmp();
    t.ok(i.factory);
    t.ok(i.components);
    t.done();
}

export function test_add(t) {
    var i = tmp();
    i.components.add(i.factory);
    i.components.add(i.factory);
    t.equals(i.components['_factory'].length, 1);
    t.done();
}

export function test_drop(t) {
    var i = tmp();
    i.components.add(i.factory);
    i.components.drop(i.factory);
    t.equals(i.components['_factory'].length, 0);
    t.done();
}

export function test_stylesheets(t) {
    var i = tmp();
    i.factory.stylesheet = 'Hi';
    i.components.add(i.factory);
    t.equals(i.impl.stylesheets, 1);
    t.done();
}

export function test_recursive_load(t) {
    var i = tmp_group();
    i.factory[0].id = '0';
    i.factory[1].id = '1';
    i.factory[2].id = '2';
    Factory.content_map['0'] = '2';
    Factory.content_map['2'] = '3';
    i.components.load({value: "0110"}, () => {
        t.equals(i.impl.instances, 8);
        t.equals(i.impl.inits, 8);
        t.equals(i.impl.injected, 4);
        t.done();
    });
}

export function test_load(t) {
    var i = tmp();
    i.factory.roots = [1, 2, 3];
    i.components.add(i.factory);
    i.components.load("Value", () => {
        t.equals(i.impl.inits, 3);
        t.equals(i.impl.instances, 3);
        t.done();
    });
}
