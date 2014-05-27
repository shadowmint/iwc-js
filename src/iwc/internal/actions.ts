import cmp = require('./component');
import async = require('./async');

/* Set of loaded components */
var _components:cmp.Component[] = [];

/* Deferred loading helper */
var _loading:any = null;

/* Validate that a component name is valid */
export function validate_name(name:string):any {
    if (name.indexOf('-') == -1) {
        throw Error('Components must be named in the NS-NAME format');
    }
    var name_parts = name.split('-');
    if (name_parts.length != 2) {
        throw Error('Components must be named in the NS-NAME format');
    }
    return {
        name: name_parts[1],
        namespace: name_parts[0]
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

/* Generate a unique updater for a component definition */
function generate_update_callback(def:cmp.Component):{(e:HTMLElement, action:cmp.ComponentChange):void} {
    return (e:HTMLElement, action:cmp.ComponentChange) => {
        try {
            var instance = def.instances[e];
        }
        catch (e) {
            throw new Error('Unable to match component for element');
        }
        try {
            action(instance.model, instance.view, instance.root);
        }
        catch (e) {
            var error = new Error('Unable to update component: ' + e.toString());
            error['innerException'] = e;
            throw error;
        }
        update_component(instance);
    };
}

/* Check if a componet has a changed state and invoke the update call on it if so */
function update_component(instance:cmp.Instance):void {
    var state = instance.state();
    if (instance.changed(state)) {
        instance.update(state);
    }
}

/* Deferred component loading */
function load_components():void {
    if (_loading != null) {
        clearTimeout(_loading);
    }
    setTimeout(() => {
        _loading = null;
        for (var i = 0; i < _components.length; ++i) {
            var component = _components[i];
            if (!component.loaded) {
                async.async(() => { load_component(component); });
            }
        }
    }, 100);
}

/* Load all instances of a single component */
function load_component(c:cmp.Component):void {
    var targets = c.targets();
    for (var i = 0; i < targets.length; ++i) {
        // Generate a unique copy of the model
        // Generate a unique copy of the view

        // Parse DOM node for component and generate template state

        // Render template & replace DOM content

        // Populate view & invoke instance handler

        // Inject stylesheet
        console.log('Processing a component target: ' + targets[i]);
    }
}
