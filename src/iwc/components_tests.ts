import c = require('./components');
import cmp = require('./component');

// test node type
class TestNode {
  value: string;
  id: number;
  constructor(value:string) {
    this.id = Math.floor(Math.random() * 1000);
    this.value = value;
  }
}

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

    injectContent(root:any, content:any, component:any, done:{(root:any):void}):void {
        if (content) {
            this.injected += 1;
            root.value = content.value;
            root['component'] = component.factory.id;
        }
        else {
          root.value = '';
        }
        done(root);
    }

    equivRoot(r1:any, r2:any):boolean {
        return r1.id === r2.id;
    }
}

// test component type
class Cmp extends cmp.Base {

    is_valid:any = null;
    inner:TestNode[] = [];
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
class Factory implements cmp.Factory {

    roots:any[];
    stylesheet:string;
    impl:TestImpl;
    id:string = null;

    public static content_map:any = {};

    constructor(impl:TestImpl, stylesheet:any = null, roots:any[] = []) {
        this.impl = impl;
        this.stylesheet = stylesheet;
        this.roots = [];
        for (var i = 0; i < roots.length; ++i) {
          this.roots.push(new TestNode(roots[i]));
        }
    }

    public factory():cmp.Component {
        var cmp = new Cmp(this.impl);
        if (this.id != null) {
            cmp.inner = Factory.content_map[this.id];
        }
        this.impl.instances += 1;
        return cmp;
    }

    public query(root:any):any[] {
        if (root.value) {
            var items = (<string> root.value).split('');
            var rtn = [];
            for (var i = 0; i < items.length; ++i) {
                if (items[i] == this.id) {
                    rtn.push(new TestNode(null));
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
    for (var i = 0; i < 5; ++i) {
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
    Factory.content_map['0'] = new TestNode('2');
    Factory.content_map['2'] = new TestNode('3');
    i.components.load(new TestNode("99011099"), () => {
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

export function test_prune(t) {
    var i = tmp();
    i.factory.roots = [1, 2, 3];
    i.components.add(i.factory);
    i.components.load("Value", () => {
      i.components.prune();
      t.equals(i.impl.inits, 3);
      t.equals(i.impl.drops, 3);
      t.done();
    });
}

export function test_data(t) {
  var i = tmp();
  i.factory.roots = [1];
  i.impl.data = {
    'data-foo': ['one', 'two', 'three'],
    'data-bar': ['one'],
    'data-foobar': ['1', '2', '3', '4', '5']
  };
  i.components.add(i.factory);
  i.components.load("Value", () => {
      var instance = i.components.query(1);
      t.equals(instance.data.foo.length, 3);
      t.equals(instance.data.bar.length, 1);
      t.equals(instance.data.foobar.length, 5);
      t.equals(instance.data._all.length, 5);
      t.equals(instance.data._all[0].foo, 'one');
      t.equals(instance.data._all[0].bar, 'one');
      t.equals(instance.data._all[0].foobar, '1');
      t.equals(instance.data._all[4].foo, undefined);
      t.equals(instance.data._all[4].bar, undefined);
      t.equals(instance.data._all[4].foobar, '5');
      t.done();
  });
}
