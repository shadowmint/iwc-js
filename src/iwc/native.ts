import c = require('./components');
import ss = require('./utils/stylesheet');
import async = require('./utils/async');
import walk = require('./utils/walker');

/** Native dom bindings for the components object api */
export class Native implements c.ComponentsImpl {

    /** Uid source */
    private static id:number = 0;

    /** Async inject a new stylesheet tag */
    injectStyles(styles:string):void {
        if (styles) {
          ss.appendStyleSheet(styles);
        }
    }

    collectData(root:any):any {
        return new walk.Walk(root).walk().attribs;
    }

    shouldPrune(root:any):boolean {
        // TODO
        return true;
    }

    /** Insert node as root or replace root with html; attach uid. */
    injectContent(root:any, content:any, done:{(root:any):void}):void {
        if (content) {
          if (typeof(content) == "string") {
            root.innerHTML = content;
            async.async(() => {
              done(root.children[0]);
            });
          }
          else {
              root.innerHTML = "";
              async.async(() => {
                try {
                  root.appendChild(content);
                  done(content);
                }
                catch(e) {
                  throw new Error("Invalid node could not be injected into the DOM");
                }
              });
          }
        }
        root['data-uid'] = this._uid();
    }

    /** Use UID's to compare node instances */
    equivRoot(r1:any, r2:any):boolean {
        return r1['data-uid'] === r2['data-uid'];
    }

    /** Generate a unique id */
    private _uid():number {
      Native.id += 1;
      return Native.id;
    }
}
