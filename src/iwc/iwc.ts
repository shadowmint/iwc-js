import cmps = require('./components');
import cmp = require('./component');
import native = require('./native');
export module iwc {

    /** The api that a manufactured instance should match */
    export interface Component extends cmp.Component { }

    /** The factory interface any component should implement */
    export interface Factory extends cmp.Factory { }

    /** A default implementation to extend */
    export class Base extends cmp.Base { }

    /** Create a new component */
    export function register(factory:Factory) {
        components.add(factory);
    }

    /** Discard a component type */
    export function deregister(factory:Factory) {
        components.drop(factory);
    }

    /** Manually prune the components list */
    export function prune() {
        components.prune();
    }

    /** Reload components from the given root node */
    export function load(root:any = null, done:{():void} = null):void {
        components.load(root, done);
    }

    /** The component register */
    var impl = new native.Native();
    export var components:cmps.Components = new cmps.Components(impl);
}

// Export module for AMD in browserify
declare var define:any;
try { define('iwc', function () { return iwc; }); } catch (e) { }
