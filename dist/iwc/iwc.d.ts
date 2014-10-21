import cmps = require('./components');
import cmp = require('./component');
export declare module iwc {
    /** The api that a manufactured instance should match */
    interface Component extends cmp.Component {
    }
    /** The factory interface any component should implement */
    interface Factory extends cmp.Factory {
    }
    /** A default implementation to extend */
    class Base extends cmp.Base {
    }
    /** Create a new component */
    function register(factory: Factory): void;
    /** Discard a component type */
    function deregister(factory: Factory): void;
    /** Manually prune the components list */
    function prune(): void;
    /** Reload components from the given root node */
    function load(root?: any, done?: () => void): void;
    var components: cmps.Components;
}
