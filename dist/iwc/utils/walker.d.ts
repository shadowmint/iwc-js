/** Walk through the DOM and touch each node */
export declare class Walk {
    /** Element root */
    root: HTMLElement;
    /** Set of loaded data attribute */
    attribs: any;
    constructor(root: HTMLElement);
    /** Walk the DOM and collect all data attributes */
    walk(): Walk;
    /** Invoke a callback for each DOM node */
    each(callback: (node: Node) => void): void;
    /** Get a list of data attributes from a node */
    data(node: Node): any[];
}
