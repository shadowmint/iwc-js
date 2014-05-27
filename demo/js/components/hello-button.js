(function (data) {
    define(['iwc', 'handlebars', 'jquery'], function (iwc, handlebars, $) {
        iwc.component({
            name: 'hello-thing',
            template: handlebars.default.compile(data.markup),
            targets: function () { return $('.component--hello-thing'); },
            state: function (model) { return [model.value] },
            update: function (model, view) { view.target.innerHTML = model.value; },
            instance: function (model, view, root) {
                $(root).find('button').click(function(e) {
                    for (var i = 0; i < model.clicks; ++i) {
                       model.value += 1;
                       model.clicks[i](e, root, model, view);
                    }
                });
            },
            model: {
                value: 0,
                clicks: []
            },
            view: {
                target: 'id-target'
            }
        });
    });
})({
    styles: ".component--thing { border: 2px solid #f00; }",
    markup: "<div><button>{{header.value}}</button><div data-id='target'>{{value}}</div></span></div>"
});