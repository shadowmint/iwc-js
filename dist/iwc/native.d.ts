import c = require('./components');
/** Native dom bindings for the components object api */
export declare class Native implements c.ComponentsImpl {
    /** Uid source */
    private static id;
    /** Async inject a new stylesheet tag */
    injectStyles(styles: string): void;
    collectData(root: any): any;
    shouldPrune(root: any): boolean;
    /** Insert node as root or replace root with html; attach uid. */
    injectContent(root: any, content: any, done: (root: any) => void): void;
    /** Use UID's to compare node instances */
    equivRoot(r1: any, r2: any): boolean;
    /** Generate a unique id */
    private _uid();
}
