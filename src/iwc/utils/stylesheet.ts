// create-stylesheet 0.2.3
// Andrew Wakeling <andrew.wakeling@gmail.com>
// create-stylesheet may be freely distributed under the MIT license.
var _stylesheet:any = {};
/**
 * For awareness of KB262161, if 31 or more total stylesheets exist when invoking appendStyleSheet, insertStyleSheetBefore or replaceStyleSheet, an error will be thrown in ANY browser.
 * If you really want to disable this error (for non-IE), set this flag to true.
 *
 * Note: Once you hit 31 stylesheets in IE8 & IE9, you will be unable to create any new stylesheets successfully (regardless of this setting) and this will ALWAYS cause an error.
 */
_stylesheet.ignoreKB262161 = false;

/**
 * Create an empty stylesheet and insert it into the DOM before the specified node. If no node is specified, then it will be appended at the end of the head.
 *
 * @param node - DOM element
 * @param callback - function(err, style)
 */
function insertEmptyStyleBefore(node, callback) {
    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    var head = document.getElementsByTagName('head')[0];
    if (node) {
        head.insertBefore(style, node);
    } else {
        head.appendChild(style);
    }
    if (style.styleSheet && style.styleSheet.disabled) {
        head.removeChild(style);
        callback('Unable to add any more stylesheets because you have exceeded the maximum allowable stylesheets. See KB262161 for more information.');
    } else {
        callback(null, style);
    }
}

/**
 * Set the CSS text on the specified style element.
 * @param style
 * @param css
 * @param callback - function(err)
 */
function setStyleCss(style, css, callback) {
    try {
        // Favor cssText over textContent as it appears to be slightly faster for IE browsers.
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else if ('textContent' in style) {
            style.textContent = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    } catch (e) {
        // Ideally this should never happen but there are still obscure cases with IE where attempting to set cssText can fail.
        return callback(e);
    }
    return callback(null);
}

/**
 * Remove the specified style element from the DOM unless it's not in the DOM already.
 *
 * Note: This isn't doing anything special now, but if any edge-cases arise which need handling (e.g. IE), they can be implemented here.
 * @param node
 */
function removeStyleSheet(node) {
    if (node.tagName === 'STYLE' && node.parentNode) {
        node.parentNode.removeChild(node);
    }
}

/**
 * Create a stylesheet with the specified options.
 * @param options - options object. e.g. {ignoreKB262161: true, replace: null, css: 'body {}' }
 * @param callback - function(err, style)
 *
 * options
 * - css; The css text which will be used to create the new stylesheet.
 * - replace; Specify a style element which will be deleted and the new stylesheet will take its place. This overrides the 'insertBefore' option.
 * - insertBefore; If specified, the new stylesheet will be inserted before this DOM node. If this value is null or undefined, then it will be appended to the head element.
 */
function createStyleSheet(options, callback) {
    if (!_stylesheet.ignoreKB262161 && document.styleSheets.length >= 31) {
        callback('Unable to add any more stylesheets because you have exceeded the maximum allowable stylesheets. See KB262161 for more information.');
    }

    insertEmptyStyleBefore(options.replace ? options.replace.nextSibling : options.insertBefore, function (err, style) {
        if (err) {
            callback(err);
        } else {
            setStyleCss(style, options.css || "", function (err) {
                if (err) {
                    removeStyleSheet(style);
                    callback(err);
                } else {
                    // TODO: Desirable to duplicate attributes to the new stylesheet. (I have seen some unusual things in IE8 so I do not think this is trivial).
                    if (options.replace) {
                        removeStyleSheet(options.replace);
                    }
                    callback(null, style);
                }
            });
        }
    });
}

export function appendStyleSheet(css, callback = (msg:any) => {}) {
    createStyleSheet({
        css: css
    }, callback);
}

export function insertStyleSheetBefore(node, css, callback = (msg:any) => {}) {
    createStyleSheet({
        insertBefore: node,
        css: css
    }, callback);
}

export function replaceStyleSheet(node, css, callback = (msg:any) => {}) {
    createStyleSheet({
        replace: node,
        css: css
    }, callback);
}
