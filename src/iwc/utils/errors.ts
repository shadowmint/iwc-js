/** Throw a custom error message */
export function raise(message:string, inner:any = null) {
    var error:any = inner !== null ? new Error(message + " (see error.inner for details)") : new Error(message);
    error.inner = inner;
    error.name = 'ComponentError';
    throw error;
}
