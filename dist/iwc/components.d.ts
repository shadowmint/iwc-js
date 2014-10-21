import cmp = require('./component');
/** Component implementation bindings */
export interface ComponentsImpl {
    /** Should the component with the given dom node be pruned */
    shouldPrune(root: any): boolean;
    /** Inject the given string (if any) into the DOM as a stylesheet */
    injectStyles(styles: string): void;
    /**
     * Collect all the data attributes from some root node
     * The result should be: { 'data-key': [...], 'data-foo': [...] }
     */
    collectData(root: any): any;
    /**
     * Inject the content into the given root node and return the new root node.
     * This operation is invoked async.
     */
    injectContent(root: any, content: any, done: (root: any) => void): void;
    /**
     * Compare two root nodes for equivalence.
     * NB. Specifically for dom nodes document.getElementById('foo') != document.getElementById('foo')
     */
    equivRoot(r1: any, r2: any): boolean;
}
/** Component registry */
export declare class Components {
    /** The implementation binding for this instance */
    private _impl;
    /** Keep a list of all component factory instances here */
    private _factory;
    /** Keep a list of all component instances here */
    private _instances;
    constructor(impl: ComponentsImpl);
    /** Cross browser index of */
    private _indexOf(needle, haystack);
    /** Load any component instances */
    load(root?: any, done?: any): void;
    /** Check if the given root already exists on some component */
    private _exists(root);
    /** Parse data values and combine them */
    private _data(data);
    /** Add a component type */
    add(factory: cmp.Factory): void;
    /** Remove a component type */
    drop(factory: cmp.Factory): void;
    /** Prune existing component instances */
    prune(): void;
    /** Query an element by root value */
    query(root: any): cmp.Component;
}
