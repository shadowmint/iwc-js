/* State fetcher for a component */
export interface ComponentState { (model:any, view:any):any[]; }

/* State updater for a component */
export interface ComponentUpdate { (model:any, view:any):void; }

/* Returns a list of component elements to expand */
export interface ComponentTargets { ():HTMLElement[]; }

/* Update component callback type */
export interface ComponentChange { (model:any, view:any, root:HTMLElement):void };

/* A component template */
export interface Component {

    /* Basic identifiers */
    namespace:string;
    name:string;

    /* Templates */
    model:any;
    view:any;
    template:string;
    styles:string;

    /* State functions */
    targets:ComponentTargets;
    state:ComponentState;
    update:ComponentUpdate;
    instance:any;

    /* Instances */
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
