(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var cmp = require('./component');
var async = require('./utils/async');
var walker = require('./utils/walker');
var clone = require('./utils/cloner');
var styles = require('./utils/stylesheet');

/* Set of loaded components */
var _components = [];

/* Deferred loading helper */
var _loading = null;

/* Validate that a component name is valid */
function validate_name(name) {
    if (name.indexOf('-') == -1) {
        throw Error('Components must be named in the NS-NAME format');
    }
    var name_parts = name.split('-');
    if (name_parts.length < 2) {
        throw Error('Components must be named in the NS-NAME format');
    }
    var ns = name_parts.shift();
    var name = name_parts.join('-');
    return {
        name: name,
        namespace: ns
    };
}
exports.validate_name = validate_name;

/*
* Create a component block for a given namespace and name
* @param def A component definition to register.
*/
function register_component(def) {
    if (!window['components']) {
        window['components'] = {};
    }
    if (!window['components'][def.namespace]) {
        window['components'][def.namespace] = {};
    }
    if (!window['components'][def.namespace][def.name]) {
        window['components'][def.namespace][def.name] = generate_update_callback(def);
    }
    _components.push(def);
    exports.load_components();
}
exports.register_component = register_component;

/* Deferred component loading */
function load_components() {
    if (_loading != null) {
        clearTimeout(_loading);
    }
    _loading = setTimeout(function () {
        _loading = null;
        for (var i = 0; i < _components.length; ++i) {
            load_component(_components[i]);
        }
    }, 100);
}
exports.load_components = load_components;

/* Generate a unique updater for a component definition */
function generate_update_callback(def) {
    var callback = function (e, action) {
        if (!def.loaded) {
            setTimeout(function () {
                callback(e, action);
            }, 100);
        } else {
            try  {
                var instance = def.instances[e];
                if (!instance) {
                    throw new Error('Unable to match component for element');
                }
            } catch (e) {
                throw new Error('Unable to match component for element');
            }
            try  {
                console.log(instance);
                action(new cmp.Ref(instance));
            } catch (e) {
                var error = new Error('Unable to update component: ' + e.toString());
                error['innerException'] = e;
                throw error;
            }
            update_component(instance);
        }
    };
    return callback;
}

/* Check if a componet has a changed state and invoke the update call on it if so */
function update_component(instance) {
    var state = instance.state ? instance.state() : null;
    if (instance.changed(state)) {
        if (instance.update) {
            instance.update(state);
        }
    }
}

/* Load all instances of a single component */
function load_component(c) {
    if (!c.loaded) {
        async.async(function () {
            // Inject stylesheet
            styles.appendStyleSheet(c.styles);

            // Load components
            var targets = c.targets();
            for (var i = 0; i < targets.length; ++i) {
                var target = targets[i];

                // Parse DOM node for component and generate template state
                var data = new walker.Walk(target).walk().attribs;

                // Generate a unique copy of the model & view
                var model = clone.clone(c.model);
                var view = clone.clone(c.view, data);

                // Populate view & invoke instance handler
                var instance = new cmp.Instance(target, c, model, view);
                var ref = new cmp.Ref(instance);

                // Preload, if any, on the original content
                if (c.preload) {
                    c.preload(ref);
                }

                // Render template & replace DOM content
                var raw = !c.template ? null : c.template({
                    data: data,
                    model: model,
                    view: view
                });

                // Populate if template worked
                if (raw != null) {
                    instance.root.innerHTML = raw;
                }

                // Invoke instance if any
                if (c.instance) {
                    c.instance(ref);
                }
                ref.update();
            }

            // Ready now!
            c.loaded = true;
        });
    }
}
//# sourceMappingURL=actions.js.map

},{"./component":3,"./utils/async":4,"./utils/cloner":5,"./utils/stylesheet":6,"./utils/walker":7}],2:[function(require,module,exports){
var actions = require('./actions');

function test_invalid_component_names_fail(test) {
    test.throws(function () {
        actions.validate_name('hello');
    }, 'Error', 'Components must be named in the NS-NAME format');
    test.done();
}
exports.test_invalid_component_names_fail = test_invalid_component_names_fail;

function test_valid_simple_component_names_pass(test) {
    actions.validate_name('ns-name');
    test.done();
}
exports.test_valid_simple_component_names_pass = test_valid_simple_component_names_pass;

function test_valid_complex_component_names_pass(test) {
    actions.validate_name('ns-name-other-part');
    test.done();
}
exports.test_valid_complex_component_names_pass = test_valid_complex_component_names_pass;
//# sourceMappingURL=actions_tests.js.map

},{"./actions":1}],3:[function(require,module,exports){
var async = require('./utils/async');



/* A public (ie safe) component reference */
var Ref = (function () {
    /* Create a light reference from an instance */
    function Ref(instance) {
        this._instance = instance;
        this.root = instance.root;
        this.model = instance.model;
        this.view = instance.view;
        this.data = instance.data;
    }
    /* Apply updates to the component */
    Ref.prototype.update = function () {
        var _this = this;
        async.async(function () {
            var state = _this._instance.state();
            _this._instance.update(state);
        });
    };

    /* Run the component callback; for events etc */
    Ref.prototype.action = function (act) {
        components[this._instance.component.namespace][this._instance.component.name](this.root, act);
    };
    return Ref;
})();
exports.Ref = Ref;

/* A component instance */
var Instance = (function () {
    /* Create a new instance of this component */
    function Instance(root, component, model, view) {
        /* Last state record for this instance */
        this._state = [];
        this.component = component;
        this.root = root;
        this.model = model;
        this.view = view;
        component.instances[root] = this;
    }
    /* Return true if the given state is not the current state */
    Instance.prototype.changed = function (state) {
        if (!state && !this._state) {
            return false;
        }
        if (state && !this._state) {
            return true;
        }
        if (!state && this._state) {
            return true;
        }
        if (this._state.length != state.length) {
            return true;
        }
        for (var i = 0; i < this._state.length; ++i) {
            if (this._state[i] != state[i]) {
                return true;
            }
        }
        return false;
    };

    /* Update this component instance and save the new state */
    Instance.prototype.update = function (state) {
        this.component.update(new Ref(this));
        this._state = state;
    };

    /* Generate a new state record and return it */
    Instance.prototype.state = function () {
        return this.component.state(new Ref(this));
    };
    return Instance;
})();
exports.Instance = Instance;
//# sourceMappingURL=component.js.map

},{"./utils/async":4}],4:[function(require,module,exports){
/* Invoke an action async */
function async(action) {
    setTimeout(function () {
        action();
    }, 1);
}
exports.async = async;
//# sourceMappingURL=async.js.map

},{}],5:[function(require,module,exports){
/* Perform a shallow clone of a dictionary */
function clone(a, ref) {
    if (typeof ref === "undefined") { ref = null; }
    var rtn = {};
    for (var key in a) {
        rtn[key] = a[key];
    }
    for (var key in ref) {
        rtn[key] = ref[key];
    }
    return JSON.parse(JSON.stringify(rtn));
}
exports.clone = clone;

/* Shallow merge dictionary b into dictionary a */
function merge(a, b) {
    for (var key in b) {
        a[key] = b[key];
    }
}
exports.merge = merge;
//# sourceMappingURL=cloner.js.map

},{}],6:[function(require,module,exports){
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
    try  {
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

function appendStyleSheet(css, callback) {
    if (typeof callback === "undefined") { callback = function (msg) {
    }; }
    createStyleSheet({
        css: css
    }, callback);
}
exports.appendStyleSheet = appendStyleSheet;

function insertStyleSheetBefore(node, css, callback) {
    if (typeof callback === "undefined") { callback = function (msg) {
    }; }
    createStyleSheet({
        insertBefore: node,
        css: css
    }, callback);
}
exports.insertStyleSheetBefore = insertStyleSheetBefore;

function replaceStyleSheet(node, css, callback) {
    if (typeof callback === "undefined") { callback = function (msg) {
    }; }
    createStyleSheet({
        replace: node,
        css: css
    }, callback);
}
exports.replaceStyleSheet = replaceStyleSheet;
//# sourceMappingURL=stylesheet.js.map

},{}],7:[function(require,module,exports){
/* Walk through the DOM and touch each node */
var Walk = (function () {
    function Walk(root) {
        this.root = root;
    }
    /* Walk the DOM and collect all data attributes */
    Walk.prototype.walk = function () {
        var _this = this;
        this.attribs = {};
        this.each(function (n) {
            _this.data(n);
        });
        for (var key in this.attribs) {
            if (this.attribs[key].length == 1) {
                this.attribs[key] = this.attribs[key][0];
            }
        }
        return this;
    };

    /* Invoke a callback for each DOM node */
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

    /* Get a list of data attributes from a node */
    Walk.prototype.data = function (node) {
        var rtn = [];
        if (node.attributes) {
            var a = [].filter.call(node.attributes, function (at) {
                return /^data-/.test(at.name);
            });
            for (var i = 0; i < a.length; ++i) {
                var name = a[i].name;
                var value = a[i].value;
                if (!this.attribs[name]) {
                    this.attribs[name] = [];
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

},{}],8:[function(require,module,exports){
var actions = require('./internal/actions');

(function (iwc) {
    /* Register a new component */
    function component(data) {
        var named = actions.validate_name(data.name);
        var component = data;
        component.name = named.name;
        component.namespace = named.namespace;
        component.instances = {};
        component.loaded = false;
        actions.register_component(component);
    }
    iwc.component = component;

    /* Load all components all over again */
    function load() {
        actions.load_components();
    }
    iwc.load = load;
})(exports.iwc || (exports.iwc = {}));
var iwc = exports.iwc;

try  {
    define('iwc', function () {
        return iwc;
    });
} catch (e) {
}
//# sourceMappingURL=iwc.js.map

},{"./internal/actions":1}]},{},[1,2,3,4,5,6,7,8])