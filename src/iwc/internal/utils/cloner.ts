/** Perform a shallow clone of a dictionary */
export function clone(a):any {
    var rtn:any = {};
    for (var key in a) {
        rtn[key] = a[key];
    }
    return JSON.parse(JSON.stringify(rtn));
}

/** Shallow merge dictionary b into dictionary a */
export function merge(a, b) {
    for (var key in b) {
        a[key] = b[key];
    }
}
