import cmp = require('./component');
import async = require('./utils/async');
import walker = require('./utils/walker');
import clone = require('./utils/cloner');
import styles = require('./utils/stylesheet');

/** Set of loaded components */
var _components:cmp.Component[] = [];

/** Deferred loading helper */
var _loading:any = null;

/** Validate that a component name is valid */
export function validate_name(name:string):any {
  if (name.indexOf('-') == -1) {
    throw Error('Components must be named in the NS-NAME format');
  }
  var name_parts = name.split('-');
  if (name_parts.length < 2) {
    throw Error('Components must be named in the NS-NAME format');
  }
  var ns = name_parts.shift();
  var name = name_parts.join('-');
  return {
    name: name,
    namespace: ns
  };
}

/*
 * Create a component block for a given namespace and name
 * @param def A component definition to register.
 */
export function register_component(def:cmp.Component):void {
  if (!window['components']) {
    window['components'] = {};
  }
  if (!window['components'][def.namespace]) {
    window['components'][def.namespace] = {};
  }
  if (!window['components'][def.namespace][def.name]) {
    window['components'][def.namespace][def.name] = generate_update_callback(def);
  }
  _components.push(def);
  load_components();
}

/** Deferred component loading */
export function load_components():void {
  if (_loading != null) {
    clearTimeout(_loading);
  }
  _loading = setTimeout(() => {
    _loading = null;
    for (var i = 0; i < _components.length; ++i) {
      load_component(_components[i]);
    }
  }, 100);
}

/** Generate a unique updater for a component definition */
function generate_update_callback(def:cmp.Component):{(e:HTMLElement, action:cmp.callbacks.Change):void} {
  var callback = (e:HTMLElement, action:cmp.callbacks.Change) => {
    if (!def.loaded) {
      setTimeout(() => {
        callback(e, action);
      }, 100)
    }
    else {
      try {
        var id = e['data-component'];
        var instance = def.instances[id];
        if (!instance) {
          throw new Error('Unable to match component for element');
        }
      }
      catch (e) {
        throw new Error('Unable to match component for element');
      }
      try {
        action(new cmp.Ref(instance));
      }
      catch (e) {
        var error = new Error('Unable to update component: ' + e.toString());
        error['innerException'] = e;
        throw error;
      }
      update_component(instance);
    }
  };
  return callback;
}

/** Check if a componet has a changed state and invoke the update call on it if so */
function update_component(instance:cmp.Instance):void {
  var state = instance.state ? instance.state() : null;
  if (instance.changed(state)) {
    if (instance.update) {
      instance.update(state);
    }
  }
}

/** Walk up the chain of parents for an object */
function inDom(target:Node):boolean {
  var tmp = target;
  while (tmp) {
    tmp = tmp.parentNode;
    if (tmp == document) {
      return true;
    }
  }
  return false;
}

/** Remove old components */
function prune_component(c:cmp.Component):void {
  for (var key in c.instances) {
    var root = c.instances[key].root;
    if (!inDom(root)) {
      delete c.instances[key];
    }
  }
}

/** Load all instances of a single component */
function load_component(c:cmp.Component):void {
  async.async(() => {

    // Inject stylesheet only the first time.
    if (!c.loaded) {
      styles.appendStyleSheet(c.styles);
    }

    // Filter components to ready ones and discard old ones
    prune_component(c);
    var all = c.targets();
    var targets = [];
    for (var i = 0; i < all.length; ++i) {
      var id = all[i]['data-component'];
      if (!id) {
        targets.push(all[i]);
      }
    }

    // Load new targets
    for (var i = 0; i < targets.length; ++i) {
      var target = targets[i]

      // Parse DOM node for component and generate template state
      var data = new walker.Walk(target).walk().attribs;

      // Generate a unique copy of the model & view
      var model = clone.clone(c.model);
      var view = clone.clone(c.view);

      // Populate view & invoke instance handler
      var instance = new cmp.Instance(target, c, model, view, data);
      var ref = new cmp.Ref(instance);

      // Preload, if any, on the original content
      if (c.preload) {
        c.preload(ref);
      }

      // Render template & replace DOM content
      var raw = !c.template ? null : c.template({
        data: data,
        model: model,
        view: view
      });

      // Populate if template worked
      if (raw != null) {
        instance.root.innerHTML = raw;
      }

      // Invoke instance if any
      if (c.instance) {
        c.instance(ref);
      }
      ref.update();
    }

    // Ready now!
    c.loaded = true;
  });
}
