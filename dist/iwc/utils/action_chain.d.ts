/** Helper to process recursive chains */
export declare class Actions {
    /** Stack of root nodes */
    roots: any[];
    /** Some callback to invoke once all the roots are loaded */
    complete: any;
    /** Process a single item */
    item: (root: any, loaded: (root: any) => void) => void;
    /** Process an item and generate some new items */
    items: (root: any) => any[];
    constructor();
    /** Push a new root node into this chain */
    push(root: any): void;
    /**
     * Process the next root node and then invoke next.
     * @param items A callback to take a root node and spit out a set of items.
     * @param item A callback to load a single item and then invoke the callback with a new root node.
     */
    process(next: () => void): void;
    /** Process all root nodes and then invoke the callback */
    all(complete: () => void): void;
}
