(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


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


var Components = (function () {
    function Components(impl) {
        this._factory = [];
        this._instances = [];
        this._impl = impl;
    }
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

    Components.prototype.load = function (root, done) {
        var _this = this;
        if (typeof root === "undefined") { root = null; }
        if (typeof done === "undefined") { done = null; }
        var action = new actions.Actions();
        action.push({ node: root, factory: null });
        action.items = function (root) {
            var rtn = [];
            for (var i = 0; i < _this._factory.length; ++i) {
                var list = _this._factory[i].query(root.node);
                for (var j = 0; j < list.length; ++j) {
                    rtn.push({ node: list[j], factory: _this._factory[i] });
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
                _this._impl.injectContent(root.node, instance.content(), function (root) {
                    if (instance.init) {
                        instance.init();
                    }
                    loaded({ node: root, factory: null });
                });
            } else {
                loaded(null);
            }
        };
        action.all(done);
    };

    Components.prototype._exists = function (root) {
        for (var i = 0; i < this._instances.length; ++i) {
            if (this._impl.equivRoot(this._instances[i].root, root)) {
                return true;
            }
        }
        return false;
    };

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

    Components.prototype.add = function (factory) {
        if (this._indexOf(factory, this._factory) == -1) {
            this._factory.push(factory);
            if (factory.stylesheet) {
                this._impl.injectStyles(factory.stylesheet);
            }
        }
    };

    Components.prototype.drop = function (factory) {
        var index = this._indexOf(factory, this._factory);
        if (index != -1) {
            this._factory.splice(index, 1);
        }
    };

    Components.prototype.prune = function () {
        var instances = [];
        for (var i = 0; i < this._instances.length; ++i) {
            try  {
                if (this._instances[i]['valid']) {
                    var valid = this._instances[i]['valid']() === true;
                } else {
                    var valid = !this._impl.shouldPrune(this._instances[i].root);
                }
            } catch (e) {
                valid = false;
            }
            if (!valid) {
                if (this._instances[i]['drop']) {
                    try  {
                        this._instances[i]['drop']();
                    } catch (e) {
                    }
                }
            } else {
                instances.push(this._instances[i]);
            }
        }
        this._instances = instances;
    };

    Components.prototype.query = function (root) {
        var rtn = null;
        if (root.length) {
            root = root[0];
        }
        for (var i = 0; i < this._instances.length; ++i) {
            if (this._impl.equivRoot(root, this._instances[i].root)) {
                rtn = this._instances[i];
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
(function (iwc) {
    

    

    var Base = (function (_super) {
        __extends(Base, _super);
        function Base() {
            _super.apply(this, arguments);
        }
        return Base;
    })(cmp.Base);
    iwc.Base = Base;

    function register(factory) {
        iwc.components.add(factory);
    }
    iwc.register = register;

    function deregister(factory) {
        iwc.components.drop(factory);
    }
    iwc.deregister = deregister;

    function prune() {
        iwc.components.prune();
    }
    iwc.prune = prune;

    function load(root, done) {
        if (typeof root === "undefined") { root = null; }
        if (typeof done === "undefined") { done = null; }
        iwc.components.load(root, done);
    }
    iwc.load = load;

    var impl = new native.Native();
    iwc.components = new cmps.Components(impl);
})(exports.iwc || (exports.iwc = {}));
var iwc = exports.iwc;

try  {
    define('iwc', function () {
        return iwc;
    });
} catch (e) {
    try  {
        window['iwc'] = iwc;
    } catch (e) {
    }
}
//# sourceMappingURL=iwc.js.map

},{"./component":1,"./components":2,"./native":4}],4:[function(require,module,exports){
var ss = require('./utils/stylesheet');
var async = require('./utils/async');
var walk = require('./utils/walker');

var Native = (function () {
    function Native() {
    }
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

    Native.prototype.injectContent = function (root, content, done) {
        if (content) {
            if (typeof (content) == "string") {
                try  {
                    root.innerHTML = content;
                } catch (e) {
                }
                async.async(function () {
                    done(root);
                });
            } else {
                root.innerHTML = "";
                async.async(function () {
                    try  {
                        root.appendChild(content);
                        done(content);
                    } catch (e) {
                        throw new Error("Invalid node could not be injected into the DOM: " + e);
                    }
                });
            }
        }
        root['data-uid'] = this._uid();
    };

    Native.prototype.equivRoot = function (r1, r2) {
        return r1['data-uid'] === r2['data-uid'];
    };

    Native.prototype._uid = function () {
        Native.id += 1;
        return Native.id;
    };
    Native.id = 0;
    return Native;
})();
exports.Native = Native;
//# sourceMappingURL=native.js.map

},{"./utils/async":6,"./utils/stylesheet":7,"./utils/walker":8}],5:[function(require,module,exports){
var async = require("./async");

var Actions = (function () {
    function Actions() {
        this.item = null;
        this.roots = [];
        this.complete = null;
    }
    Actions.prototype.push = function (root) {
        this.roots.push(root);
    };

    Actions.prototype.process = function (next) {
        var _this = this;
        if (this.roots.length) {
            var root = this.roots.pop();
            var found = this.items(root);
            if (found.length == 0) {
                next();
            } else {
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
        } else if (this.complete) {
            this.complete();
        }
    };

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
function async(action) {
    setTimeout(function () {
        action();
    }, 1);
}
exports.async = async;
//# sourceMappingURL=async.js.map

},{}],7:[function(require,module,exports){
var _stylesheet = {};

_stylesheet.ignoreKB262161 = false;

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

function setStyleCss(style, css, callback) {
    try  {
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else if ('textContent' in style) {
            style.textContent = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    } catch (e) {
        return callback(e);
    }
    return callback(null);
}

function removeStyleSheet(node) {
    if (node.tagName === 'STYLE' && node.parentNode) {
        node.parentNode.removeChild(node);
    }
}

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

},{}],8:[function(require,module,exports){
var Walk = (function () {
    function Walk(root) {
        this.root = root;
    }
    Walk.prototype.walk = function () {
        var _this = this;
        this.attribs = {};
        this.each(function (n) {
            _this.data(n);
        });
        return this;
    };

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