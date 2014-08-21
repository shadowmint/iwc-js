/** Invoke an action async */
export function async(action:any):void {
    setTimeout(() => {
        action();
    }, 1);
}
