/// <reference path="deps/__init__.ts"/>
/// <reference path="module/__init__.ts"/>
var runner = new turn.TestRunner();
runner.load(tests);
runner.execute()
runner.report()
