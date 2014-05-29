/* A component definition from a component() call */
export interface ComponentDef {

    /* Name */
    name:string;
    namespace:string;

    /* Templates */
    model:any;
    view:any;
    styles:string;

    /* Callbacks for component instance */
    template:callbacks.Template;
    targets:callbacks.Targets;
    state:callbacks.State;
    update:callbacks.Update;
    instance:callbacks.Instance;
}

/* A component template */
export interface Component extends ComponentDef {

    /* Instances of this component */
    instances:any;

    /* If this component is loaded yet */
    loaded:boolean;
}

/* A component instance */
export class Instance {

    /* The component associated with this instance */
    public component:Component;

    /* Public reference for this component */
    public root:HTMLElement;
    public model:any;
    public view:any;

    /* Last state record for this instance */
    private _state:any[] = [];

    /* Create a new instance of this component */
    public constructor(root:HTMLElement, component:Component, model:any, view:any) {
        this.component = component;
        this.root = root;
        this.model = model;
        this.view = view;
        component.instances[root] = this;
    }

    /* Return true if the given state is not the current state */
    public changed(state:any[]):boolean {
        if (this._state.length != state.length) {
            return true;
        }
        for (var i = 0; i < this._state.length; ++i) {
            if (this._state[i] != state[i]) {
                return true;
            }
        }
        return false;
    }

    /* Update this component instance and save the new state */
    public update(state:any[]):void {
        this.component.update(this.model, this.view);
        this._state = state;
    }

    /* Generate a new state record and return it */
    public state():any[] {
        return this.component.state(this.model, this.view);
    }
}

export module callbacks {

    /* State fetcher for a component */
    export interface State { (model:any, view:any):any[]; }

    /* State updater for a component */
    export interface Update { (model:any, view:any):void; }

    /* Returns a list of component elements to expand */
    export interface Targets { ():HTMLElement[]; }

    /* Update component callback type */
    export interface Change { (model:any, view:any, root:HTMLElement):void }

    /* Generate a component layout from a state model */
    export interface Template { (state:any):string }

    /* Initialize a component instance */
    export interface Instance { (model:any, view:any, root:HTMLElement):void }
}
