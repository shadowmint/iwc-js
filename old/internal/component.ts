import async = require('./utils/async');
declare var components;

/** A component definition from a component() call */
export interface ComponentDef {

  /** Name */
  name:string;

  /** Templates */
  model:any;
  view:any;
  styles:string;

  /** Callbacks for component instance */
  template:callbacks.Template;
  targets:callbacks.Targets;
  state:callbacks.State;
  update:callbacks.Update;
  instance:callbacks.Instance;
  preload:callbacks.Preload;
  api:callbacks.Api;
}

/** A full component template */
export interface Component extends ComponentDef {

  /** Internal instance id namespace */
  next_id:number;

  /** Actual namespace derived from name */
  namespace:string;

  /** Instances of this component */
  instances:any;

  /** If this component is loaded yet */
  loaded:boolean;
}

/** A public (ie safe) component reference */
export class Ref {
  private _instance:Instance;
  public root:HTMLElement;
  public model:any;
  public view:any;
  public data:any;
  public api:any;

  /** Create a light reference from an instance */
  public constructor(instance:Instance) {
    this._instance = instance;
    this.root = instance.root;
    this.model = instance.model;
    this.view = instance.view;
    this.data = instance.data;
    this.api = instance.api;
  }

  /** Apply updates to the component */
  public update():void {
    async.async(() => {
      var state = this._instance.state();
      this._instance.update(state);
    });
  }

  /** Run the component callback; for events etc */
  public action(act:{(r:Ref):void}):void{
    components[this._instance.component.namespace][this._instance.component.name](this.root, act);
  }
}

/** A component instance */
export class Instance {

  /** The component associated with this instance */
  public component:Component;

  /** Public reference for this component */
  public id:number;
  public root:HTMLElement;
  public model:any;
  public view:any;
  public data:any;
  public api:any;

  /** Last state record for this instance */
  private _state:any[] = [];

  /** Create a new instance of this component */
  public constructor(root:HTMLElement, component:Component, model:any, view:any, data:any) {
    this.component = component;
    this.root = root;
    this.model = model;
    this.view = view;
    this.data = data;
    this.api = component.api();
    this.id = component.next_id;
    this.root['data-component'] = this.id;
    component.instances[this.id] = this;
    component.next_id += 1;
  }

  /** Return true if the given state is not the current state */
  public changed(state:any[]):boolean {
    if (!state && !this._state) {
      return false;
    }
    if (state && !this._state) {
      return true;
    }
    if (!state && this._state) {
      return true;
    }
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

  /** Update this component instance and save the new state */
  public update(state:any[]):void {
    this.component.update(new Ref(this));
    this._state = state;
  }

  /** Generate a new state record and return it */
  public state():any[] {
    return this.component.state(new Ref(this));
  }
}

export module callbacks {

  /** State fetcher for a component */
  export interface State { (ref:Ref):any[]; }

  /** State updater for a component */
  export interface Update { (ref:Ref):void; }

  /** Update component callback type */
  export interface Change { (ref:Ref):void; }

  /** Returns a list of component elements to expand */
  export interface Targets { (root:Node):HTMLElement[]; }

  /** Generate a component layout from a state model */
  export interface Template { (data:any):string; }

  /** Return a component api */
  export interface Api { ():any; }

  /** Initialize a component instance */
  export interface Preload { (ref:Ref):void; }

  /** Initialize a component instance */
  export interface Instance { (ref:Ref):void; }
}