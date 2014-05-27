import actions = require('./internal/actions');

/* Register a new component */
export function component(name:string, model:any, view:any, template, styles, state, update, instance) {
    var named = actions.validate_name(name);
    actions.register_component({
        namespace: named.namespace,
        name: named.name,
        model: model,
        view: view,
        targets:null,
        template: template,
        styles: styles,
        state: state,
        update: update,
        instance: instance,
        instances: {},
        loaded: false
    });
}

