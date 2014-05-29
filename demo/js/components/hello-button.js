(function (data) {
    define(['iwc', 'handlebars', 'jquery'], function (iwc, handlebars, $) {
        console.log(iwc);
        console.log(handlebars);
        console.log($);
        iwc.component({
            name: 'hello-thing',
            template: handlebars.default.compile(data.markup),
            targets: function () { return $('.component--hello-thing'); },
            state: function (model) { return [model.value] },
            update: function (model, view) {
                console.log('UPDATE');
                view.target.html(model.value);
            },
            instance: function (model, view, root) {
                view.target = $(root).find('.target');
                console.log($(root).find('button'));
                $(root).find('button').click(function(e) {
                    console.log('EVENT');
                    model.value += 1;
                    for (var i = 0; i < model.clicks; ++i) {
                       model.clicks[i](e, root, model, view);
                    }
                });
            },
            model: {
                value: 0,
                clicks: []
            },
            view: {
                target: null
            }
        });
    });
})({
    styles: ".component--thing { border: 2px solid #f00; }",
    markup: "<div><button>{{state.data-header}}</button><div class='target'>{{model.value}}</div></span></div>"
});