import c = require('./components');

/** Native dom bindings for the components object api */
class Native implements c.ComponentsImpl {

    public stylesheets:number = 0;
    public instances:number = 0;
    public inits:number = 0;
    public injected:number = 0;
    public drops:number = 0;
    public data:any = null;

    shouldPrune(root:any):boolean {
        return true;
    }

    injectStyles(styles:string):void {
        if (styles) {
            this.stylesheets += 1;
        }
    }

    collectData(root:any):any {
        return this.data;
    }

    injectContent(root:any, content:any):void {
        if (content) {
            this.injected += 1;
            root.value = content;
        }
        else {
          root.value = '';
        }
    }

    equivRoot(r1:any, r2:any):boolean {
        return r1 === r2;
    }
}
