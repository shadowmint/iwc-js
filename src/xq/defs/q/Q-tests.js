/// <reference path="../jquery/jquery.d.ts" />
/// <reference path="Q.d.ts" />
Q(8).then(function (x) {
    return console.log(x.toExponential());
});

var delay = function (delay) {
    var d = Q.defer();
    setTimeout(d.resolve, delay);
    return d.promise;
};

Q.when(delay(1000), function (val) {
    console.log('Hello, World!');
    return;
});

Q.timeout(Q(new Date()), 1000, "My dates never arrived. :(").then(function (d) {
    return d.toJSON();
});

Q.delay(Q(8), 1000).then(function (x) {
    return x.toExponential();
});
Q.delay(8, 1000).then(function (x) {
    return x.toExponential();
});
Q.delay(Q("asdf"), 1000).then(function (x) {
    return x.length;
});
Q.delay("asdf", 1000).then(function (x) {
    return x.length;
});

var eventualAdd = Q.promised(function (a, b) {
    return a + b;
});
eventualAdd(Q(1), Q(2)).then(function (x) {
    return x.toExponential();
});

var eventually = function (eventually) {
    return Q.delay(eventually, 1000);
};

var x = Q.all([1, 2, 3].map(eventually));
Q.when(x, function (x) {
    console.log(x);
});

Q.all([
    eventually(10),
    eventually(20)
]).spread(function (x, y) {
    console.log(x, y);
});

Q.fcall(function () {
}).then(function () {
}).then(function () {
}).then(function () {
}).then(function (value4) {
    // Do something with value4
}, function (error) {
    // Handle any error from step1 through step4
}).done();

Q.allResolved([]).then(function (promises) {
    promises.forEach(function (promise) {
        if (promise.isFulfilled()) {
            var value = promise.valueOf();
        } else {
            var exception = promise.valueOf().exception;
        }
    });
});

Q(arrayPromise).then(function (arr) {
    return arr.join(',');
}).then(returnsNumPromise).then(function (num) {
    return num.toFixed();
});

// if jQuery promises definition supported generics, this could be more interesting example
Q(jPromise).then(function (str) {
    return str.split(',');
});
jPromise.then(returnsNumPromise);

// watch the typing flow through from jQueryPromise to Q.Promise
Q(jPromise).then(function (str) {
    return str.split(',');
});

var qPromiseArray = promiseArray.map(function (p) {
    return Q(p);
});
var myNums = [2, 3, Q(4), 5, Q(6), Q(7)];

Q.all(promiseArray).then(function (nums) {
    return nums.map(function (num) {
        return num.toPrecision(2);
    }).join(',');
});

Q.all(myNums).then(function (nums) {
    return nums.map(Math.round);
});

Q.fbind(function (dateString) {
    return new Date(dateString);
}, "11/11/1991")().then(function (d) {
    return d.toLocaleDateString();
});

Q.when(8, function (num) {
    return num + "!";
});
Q.when(Q(8), function (num) {
    return num + "!";
}).then(function (str) {
    return str.split(',');
});

Q.allSettled([saveToDisk(), saveToCloud()]).spread(function (disk, cloud) {
    console.log("saved to disk:", disk.state === "fulfilled");
    console.log("saved to cloud:", cloud.state === "fulfilled");

    if (disk.state === "fulfilled") {
        console.log("value was " + disk.value);
    } else if (disk.state === "rejected") {
        console.log("rejected because " + disk.reason);
    }
}).done();

var nodeStyle = function (input, cb) {
    cb(null, input);
};

Q.nfapply(nodeStyle, ["foo"]).done(function (result) {
});
Q.nfcall(nodeStyle, "foo").done(function (result) {
});
//# sourceMappingURL=Q-tests.js.map
