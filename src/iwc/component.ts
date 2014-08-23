
/** The api that a manufactured instance should match */
export interface Component {

    /** The root element for this node */
    root:any;

    /** The factory this element came from */
    factory:Factory;

    /**
     * Handle the data natively found in a component instance.
     * This is an aggregate of the data elements found in the component.
     * For exampl109Ge, if the component is:
     *
     *      <div class="component-x" data-y="100">
     *          <div data-item="item1" data-value="one"/>
     *          <div data-item="item2" data-value="two"/>
     *          <div data-item="item3" data-value="three"/>
     *          <div data-item="item4">
     *          <li data-y="101">
     *          </div>
     *      </div>
     *
     * The data object will be:
     *
     *      {
     *          y: ["100", "101"],
     *          item: ["item1", "item2", "item3", "item4"],
     *          value: ["one", "two", "three"],
     *          _all: [
     *              { y: "100", item: "item1", value: "one" },
     *              { y: "100", item: "item2", value: "two" },
     *              { y: null,  item: "item3", value: "three" },
     *              { y: null,  item: "item4", value: null },
     *          ]
     *      }
     *
     * Note specifically the _all field is reserved for combined data
     * values; values which are not set in that array group are set to null.
     */
    data:any;

    /**
     * Generate the content to render inside the component.
     * Return a string to set the inner HTML to that value.
     * Return an HTMLElement to replace the inner content with that element.
     * Return null to leave the inner content unchanged.
     */
    content():any;

    /** Invoked once the content has been added to the DOM, async */
    init():void;

    /** Return a public api for the component instance */
    api():any;

    /** This is a generic hook to invoke when the component is dropped */
    drop():void;

    /**
     * This is a generic hook for checking if an object should be dropped
     * By default this is implemented as a walk up the dom looking for 'body'
     * which is invoked if this returns null or it is not implemented.
     */
    valid():boolean;
}

/** The factory interface any component should implement */
export interface Factory {

    /** Generate a list of HTML elements to load as components */
    query(root:any):any[];

    /** Generate a component instance from the given root node */
    factory():Component;

    /** Return a serialized stylesheet as a string to inject, or null */
    stylesheet:string;
}

/** A default implementation to extend */
export class Base implements Component {

    public data:any;
    public root:any;
    public factory:Factory;

    public content():any {
        return null;
    }

    public init():any {
    }

    public api():any {
        return this;
    }

    public drop():void {
      this.root = null;
      this.data = null;
    }

    public valid():any {
      return null;
    }
}
