declare module IWC {

    export interface Component {
        root: any;
        factory: Factory;
        data: any;
        content(): any;
        init(): void;
        api(): any;
        drop(): void;
        valid(): boolean;
    }

    export interface Factory {
        query(root: any): any[];
        factory(): Component;
        stylesheet: string;
    }

    export class Base implements Component {
        public data: any;
        public root: any;
        public factory: Factory;
        public content(): any;
        public init(): any;
        public api(): any;
        public drop(): void;
        public valid(): any;
    }

    export interface ComponentsImpl {
        shouldPrune(root: any): boolean;
        injectStyles(styles: string): void;
        collectData(root: any): any;
        injectContent(root: any, content: any, done: (root: any) => void): void;
        equivRoot(r1: any, r2: any): boolean;
    }

    export class Components {
        private _impl;
        private _factory;
        private _instances;
        constructor(impl: ComponentsImpl);
        private _indexOf(needle, haystack);
        public load(root?: any, done?: any): void;
        private _exists(root);
        private _data(data);
        public add(factory: Factory): void;
        public drop(factory: Factory): void;
        public prune(): void;
        public query(root: any):any;
    }

    export function register(factory: Factory): void;
    export function deregister(factory: Factory): void;
    export function prune(): void;
    export function load(root?: any, done?: () => void): void;
    export var components:Components;
}

declare module "iwc" {
    export = IWC;
}
