import actions = require('./internal/actions');
import cmp = require('./internal/component')
export module iwc {

    /* Register a new component */
    export function component(data:cmp.ComponentDef):void {
        var named = actions.validate_name(data.name);
        var component = <cmp.Component> data;
        component.name = named.name;
        component.namespace = named.namespace;
        component.instances = {};
        component.loaded = false;
        actions.register_component(component);
    }
}

// Export module for AMD
declare var define:any;
define('iwc', function() {
    return iwc;
});
