(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** A default implementation to extend */
var Base = (function () {
    function Base() {
    }
    Base.prototype.content = function () {
        return null;
    };
    Base.prototype.init = function () {
    };
    Base.prototype.api = function () {
        return this;
    };
    Base.prototype.drop = function () {
        this.root = null;
        this.data = null;
    };
    Base.prototype.valid = function () {
        return null;
    };
    return Base;
})();
exports.Base = Base;
//# sourceMappingURL=component.js.map
},{}],2:[function(require,module,exports){
var actions = require('./utils/action_chain');
/** Component registry */
var Components = (function () {
    function Components(impl) {
        /** Keep a list of all component factory instances here */
        this._factory = [];
        /** Keep a list of all component instances here */
        this._instances = [];
        this._impl = impl;
    }
    /** Cross browser index of */
    Components.prototype._indexOf = function (needle, haystack) {
        var index = -1;
        for (var i = 0; i < haystack.length; ++i) {
            if (haystack[i] == needle) {
                index = i;
                break;
            }
        }
        return index;
    };
    /** Load any component instances */
    Components.prototype.load = function (root, done) {
        var _this = this;
        if (root === void 0) { root = null; }
        if (done === void 0) { done = null; }
        var action = new actions.Actions();
        action.push({ node: root, factory: null });
        action.items = function (root) {
            var rtn = [];
            for (var i = 0; i < _this._factory.length; ++i) {
                var list = _this._factory[i].query(root.node);
                for (var j = 0; j < list.length; ++j) {
                    if (!_this._exists(list[j])) {
                        rtn.push({ node: list[j], factory: _this._factory[i] });
                    }
                }
            }
            return rtn;
        };
        action.item = function (root, loaded) {
            if ((root.factory) && (root.node)) {
                var instance = root.factory.factory();
                instance.root = root.node;
                instance.data = _this._data(_this._impl.collectData(root.node));
                instance.factory = root.factory;
                _this._instances.push(instance);
                var content = instance.content ? instance.content() : null;
                _this._impl.injectContent(root.node, content, function (root) {
                    if (instance.init) {
                        instance.init();
                    }
                    loaded({ node: root, factory: null });
                });
            }
            else {
                loaded(null);
            }
        };
        action.all(done);
    };
    /** Check if the given root already exists on some component */
    Components.prototype._exists = function (root) {
        for (var i = 0; i < this._instances.length; ++i) {
            if (this._impl.equivRoot(this._instances[i].root, root)) {
                return true;
            }
        }
        return false;
    };
    /** Parse data values and combine them */
    Components.prototype._data = function (data) {
        var rtn = {};
        var all = [];
        for (var key in data) {
            var name = key.split('data-').length == 2 ? key.split('data-')[1] : null;
            if (name) {
                var items = data[key];
                for (var i = 0; i < items.length; ++i) {
                    if (!all[i]) {
                        all[i] = {};
                    }
                    var __all = all[i];
                    if (!rtn[name]) {
                        rtn[name] = [];
                    }
                    rtn[name].push(items[i]);
                    __all[name] = items[i];
                }
            }
        }
        rtn['_all'] = all;
        return rtn;
    };
    /** Add a component type */
    Components.prototype.add = function (factory) {
        if (this._indexOf(factory, this._factory) == -1) {
            this._factory.push(factory);
            if (factory.stylesheet) {
                this._impl.injectStyles(factory.stylesheet);
            }
        }
    };
    /** Remove a component type */
    Components.prototype.drop = function (factory) {
        var index = this._indexOf(factory, this._factory);
        if (index != -1) {
            this._factory.splice(index, 1);
        }
    };
    /** Prune existing component instances */
    Components.prototype.prune = function () {
        var instances = [];
        for (var i = 0; i < this._instances.length; ++i) {
            try {
                if (this._instances[i]['valid']) {
                    var valid = this._instances[i]['valid']() === true;
                }
                else {
                    var valid = !this._impl.shouldPrune(this._instances[i].root);
                }
            }
            catch (e) {
                valid = false;
            }
            if (!valid) {
                if (this._instances[i]['drop']) {
                    try {
                        this._instances[i]['drop']();
                    }
                    catch (e) {
                    }
                }
            }
            else {
                instances.push(this._instances[i]);
            }
        }
        this._instances = instances;
    };
    /** Query an element by root value */
    Components.prototype.query = function (root) {
        var rtn = null;
        if (root.length) {
            root = root[0];
        } // Support jquery
        for (var i = 0; i < this._instances.length; ++i) {
            if (this._impl.equivRoot(root, this._instances[i].root)) {
                rtn = this._instances[i]['api'] ? this._instances[i].api() : this._instances[i];
                break;
            }
        }
        return rtn;
    };
    return Components;
})();
exports.Components = Components;
//# sourceMappingURL=components.js.map
},{"./utils/action_chain":5}],3:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var cmps = require('./components');
var cmp = require('./component');
var native = require('./native');
var iwc;
(function (iwc) {
    /** A default implementation to extend */
    var Base = (function (_super) {
        __extends(Base, _super);
        function Base() {
            _super.apply(this, arguments);
        }
        return Base;
    })(cmp.Base);
    iwc.Base = Base;
    /** Create a new component */
    function register(factory) {
        iwc.components.add(factory);
    }
    iwc.register = register;
    /** Discard a component type */
    function deregister(factory) {
        iwc.components.drop(factory);
    }
    iwc.deregister = deregister;
    /** Manually prune the components list */
    function prune() {
        iwc.components.prune();
    }
    iwc.prune = prune;
    /** Reload components from the given root node */
    function load(root, done) {
        if (root === void 0) { root = null; }
        if (done === void 0) { done = null; }
        iwc.components.load(root, done);
    }
    iwc.load = load;
    /** The component register */
    var impl = new native.Native();
    iwc.components = new cmps.Components(impl);
})(iwc = exports.iwc || (exports.iwc = {}));
try {
    define('iwc', function () {
        return iwc;
    });
}
catch (e) {
    try {
        window['iwc'] = iwc;
    }
    catch (e) {
    }
}
//# sourceMappingURL=iwc.js.map
},{"./component":1,"./components":2,"./native":4}],4:[function(require,module,exports){
var ss = require('./utils/stylesheet');
var async = require('./utils/async');
var walk = require('./utils/walker');
/** Native dom bindings for the components object api */
var Native = (function () {
    function Native() {
    }
    /** Async inject a new stylesheet tag */
    Native.prototype.injectStyles = function (styles) {
        if (styles) {
            ss.appendStyleSheet(styles);
        }
    };
    Native.prototype.collectData = function (root) {
        return new walk.Walk(root).walk().attribs;
    };
    Native.prototype.shouldPrune = function (root) {
        console.log("Does body contain node");
        console.log(root);
        console.log(document.body.contains(root));
        return !document.body.contains(root);
    };
    /** Insert node as root or replace root with html; attach uid. */
    Native.prototype.injectContent = function (root, content, done) {
        if (content) {
            if (typeof (content) == "string") {
                try {
                    root.innerHTML = content;
                }
                catch (e) {
                }
                async.async(function () {
                    done(root);
                });
            }
            else {
                root.innerHTML = "";
                async.async(function () {
                    try {
                        root.appendChild(content);
                        done(content);
                    }
                    catch (e) {
                        throw new Error("Invalid node could not be injected into the DOM: " + e);
                    }
                });
            }
        }
        else {
            async.async(function () {
                done(root);
            });
        }
        if (root.setAttribute) {
            root.setAttribute('data-iwc', this._uid());
        }
        else {
            root['data-iwc'] = this._uid();
        }
    };
    /** Use UID's to compare node instances */
    Native.prototype.equivRoot = function (r1, r2) {
        if ((r1.getAttribute) && (r2.getAttribute))
            return r1.getAttribute('data-iwc') === r2.getAttribute('data-iwc');
        return r1['data-iwc'] === r2['data-iwc'];
    };
    /** Generate a unique id */
    Native.prototype._uid = function () {
        Native.id += 1;
        return Native.id;
    };
    /** Uid source */
    Native.id = 0;
    return Native;
})();
exports.Native = Native;
//# sourceMappingURL=native.js.map
},{"./utils/async":6,"./utils/stylesheet":7,"./utils/walker":8}],5:[function(require,module,exports){
var async = require("./async");
/** Helper to process recursive chains */
var Actions = (function () {
    function Actions() {
        /** Process a single item */
        this.item = null;
        this.roots = [];
        this.complete = null;
    }
    /** Push a new root node into this chain */
    Actions.prototype.push = function (root) {
        this.roots.push(root);
    };
    /**
     * Process the next root node and then invoke next.
     * @param items A callback to take a root node and spit out a set of items.
     * @param item A callback to load a single item and then invoke the callback with a new root node.
     */
    Actions.prototype.process = function (next) {
        var _this = this;
        if (this.roots.length) {
            var root = this.roots.pop();
            var found = this.items(root);
            if (found.length == 0) {
                next();
            }
            else {
                var waiting = found.length;
                var maybe_done = function () {
                    waiting -= 1;
                    if (waiting <= 0) {
                        next();
                    }
                };
                for (var i = 0; i < found.length; ++i) {
                    this.item(found[i], function (root) {
                        if (root != null) {
                            _this.roots.push(root);
                        }
                        maybe_done();
                    });
                }
            }
        }
        else if (this.complete) {
            this.complete();
        }
    };
    /** Process all root nodes and then invoke the callback */
    Actions.prototype.all = function (complete) {
        var _this = this;
        this.complete = complete;
        var execute = function () {
            async.async(function () {
                _this.process(function () {
                    execute();
                });
            });
        };
        execute();
    };
    return Actions;
})();
exports.Actions = Actions;
//# sourceMappingURL=action_chain.js.map
},{"./async":6}],6:[function(require,module,exports){
/** Invoke an action async */
function async(action) {
    setTimeout(function () {
        action();
    }, 1);
}
exports.async = async;
//# sourceMappingURL=async.js.map
},{}],7:[function(require,module,exports){
// create-stylesheet 0.2.3
// Andrew Wakeling <andrew.wakeling@gmail.com>
// create-stylesheet may be freely distributed under the MIT license.
var _stylesheet = {};
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
    }
    else {
        head.appendChild(style);
    }
    if (style.styleSheet && style.styleSheet.disabled) {
        head.removeChild(style);
        callback('Unable to add any more stylesheets because you have exceeded the maximum allowable stylesheets. See KB262161 for more information.');
    }
    else {
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
        }
        else if ('textContent' in style) {
            style.textContent = css;
        }
        else {
            style.appendChild(document.createTextNode(css));
        }
    }
    catch (e) {
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
        }
        else {
            setStyleCss(style, options.css || "", function (err) {
                if (err) {
                    removeStyleSheet(style);
                    callback(err);
                }
                else {
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
function appendStyleSheet(css, callback) {
    if (callback === void 0) { callback = function (msg) {
    }; }
    createStyleSheet({
        css: css
    }, callback);
}
exports.appendStyleSheet = appendStyleSheet;
function insertStyleSheetBefore(node, css, callback) {
    if (callback === void 0) { callback = function (msg) {
    }; }
    createStyleSheet({
        insertBefore: node,
        css: css
    }, callback);
}
exports.insertStyleSheetBefore = insertStyleSheetBefore;
function replaceStyleSheet(node, css, callback) {
    if (callback === void 0) { callback = function (msg) {
    }; }
    createStyleSheet({
        replace: node,
        css: css
    }, callback);
}
exports.replaceStyleSheet = replaceStyleSheet;
//# sourceMappingURL=stylesheet.js.map
},{}],8:[function(require,module,exports){
/** Walk through the DOM and touch each node */
var Walk = (function () {
    function Walk(root) {
        this.root = root;
    }
    /** Walk the DOM and collect all data attributes */
    Walk.prototype.walk = function () {
        var _this = this;
        this.attribs = {};
        this.each(function (n) {
            _this.data(n);
        });
        return this;
    };
    /** Invoke a callback for each DOM node */
    Walk.prototype.each = function (callback) {
        var stack = [this.root];
        while (stack.length != 0) {
            var n = stack.shift();
            callback(n);
            for (var i = 0; i < n.childNodes.length; ++i) {
                stack.push(n.childNodes[i]);
            }
        }
    };
    /** Get a list of data attributes from a node */
    Walk.prototype.data = function (node) {
        var rtn = [];
        if (node.attributes) {
            var a = [];
            for (var i = 0; i < node.attributes.length; ++i) {
                var at = node.attributes[i];
                if (/^data-/.test(at.name)) {
                    a.push(at);
                }
            }
            for (var i = 0; i < a.length; ++i) {
                var name = a[i].name;
                var value = a[i].value;
                if (!this.attribs[name]) {
                    this.attribs[name] = [];
                }
                if (!value) {
                    value = node;
                }
                this.attribs[name].push(value);
            }
        }
        return rtn;
    };
    return Walk;
})();
exports.Walk = Walk;
//# sourceMappingURL=walker.js.map
},{}]},{},[1,2,3,4,5,6,7,8]);
