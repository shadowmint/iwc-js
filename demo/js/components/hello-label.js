(function(data) {
  define(['iwc', 'handlebars'], function(iwc, handlebars) {
    var matcher = function(e) {
      e.className == 'namespace-mine'
    };
    var template = handlebars.compile(data.markup);

    var model = {
      value: 10
    };
    var view = {
      target: 'id-target'
    };

    var state = function(model, view) {
      return [model.value]
    };
    var update = function(model, view) {
      view.target.innerHTML = model.value;
    };
    var instance = function(ref) {};

    iwc.component(
      'namespace', 'mine', matcher,
      model, template, styles,
      state, update, instance
    );
  });
})({
  styles: ".component--thing {\n}",
  markup: "<span>{{header.value}}</span><span><div data-id='target'>{{value}}</div></span>"
});