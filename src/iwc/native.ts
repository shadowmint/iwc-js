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
        console.log("Does body contain node");
        console.log(root);
        console.log(document.body.contains(root));
        return !document.body.contains(root);
    }

    /** Insert node as root or replace root with html; attach uid. */
    injectContent(root:any, content:any, done:{(root:any):void}):void {
        if (content) {
          if (typeof(content) == "string") {
            try {
              root.innerHTML = content;
            }
            catch(e) {
              // Some browsers, notably IE, generate internal errors
              // when setting innerHTML for some elements, eg. section
              // Consume these errors silently.
            }
            async.async(() => { done(root); });
          }
          else {
              root.innerHTML = "";
              async.async(() => {
                try {
                  root.appendChild(content);
                  done(content);
                }
                catch(e) {
                  throw new Error("Invalid node could not be injected into the DOM: " + e);
                }
              });
          }
        }
        else {
            async.async(() => { done(root); });
        }
        if (root.setAttribute) {
            root.setAttribute('data-iwc', this._uid());
        }
        else {
            root['data-iwc'] = this._uid();
        }
    }

    /** Use UID's to compare node instances */
    equivRoot(r1:any, r2:any):boolean {
        if ((r1.getAttribute) && (r2.getAttribute))
            return r1.getAttribute('data-iwc') === r2.getAttribute('data-iwc');
        return r1['data-iwc'] === r2['data-iwc'];
    }

    /** Generate a unique id */
    private _uid():number {
      Native.id += 1;
      return Native.id;
    }
}
