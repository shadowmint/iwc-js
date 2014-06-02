(function (data) {
    define(['iwc', 'handlebars', 'jquery'], function (iwc, handlebars, $) {
        iwc.component({

            // The name of this component
            name: 'hello-button',

            // The markup template is compiled as a handlebars template
            template: handlebars.default.compile(data.markup),

            // Stylesheet
            styles: data.styles,

            // This is the model template for the component
            model: {
                value: 0,
                clicks: []
            },

            // This is the view template for the component
            view: {
                target: '.target',
                'data-loaded': null
            },

            // Find all the nodes in the DOM to apply this to
            targets: function () {
                return $('.component--hello-button');
            },

            // Return an array to detect state changes on the component
            state: function (ref) {
                return [ref.model.value]
            },

            // Update the component from the model
            update: function (ref) {
                var view = ref.view;
                var model = ref.model;
                view.target.html(model.value);
            },

            // Invoke this setup on each component instance
            instance: function (ref) {
                var root = ref.root;
                var model = ref.model;
                var view = ref.view;

                // Populate view
                view.target = $(root).find('.target');

                // Update on click events
                $(root).find('button').click(function(e) {
                    console.log(model);
                    model.value += 1;
                    for (var i = 0; i < model.clicks.length; ++i) {
                       model.clicks[i](e, root, model, view);
                    }
                    ref.update();
                });

                // Run custom init script when loaded
                if (view['data-loaded']) {
                    eval(view['data-loaded']);
                }
            }
        });
    });
})({
    styles: ".component--hello-button { padding: 10px; border-radius: 5px; background: #efefef; font-family: sans-serif; border: 1px solid #9f9f9f; text-transform: uppercase; } .component--hello-button .clicks { float: right; font-size: 0.8em; } .component--hello-button button { width: 500px; height: 50px; line-height: 50px; font-size: 1.2em; font-weight: bold; }",
    markup: "<div><button>{{data.data-header}}</button><div class='clicks'>clicks: <span class='target'>{{model.value}}</span></div></div>"
});
