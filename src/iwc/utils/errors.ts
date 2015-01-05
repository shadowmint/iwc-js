/** Throw a custom error message */
export function raise(message:string, inner:any = null, level:string='Fatal') {
    throw {
        name: 'Component Error',
        message: message,
        level: level,
        inner: inner
    };
}