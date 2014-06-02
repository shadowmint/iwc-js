(function (data) {
    define(['iwc', 'handlebars', 'jquery'], function (iwc, handlebars, $) {
        iwc.component({

            // The name of this component
            name: 'hello-label',

            // The markup template is compiled as a handlebars template
            template: handlebars.default.compile(data.markup),

            // Component stylesheet
            styles: data.styles,

            // This is the model template for the component
            model: {
                value: 'Value goes here'
            },

            // This is the view template for the component
            view: {
                target: '.target'
            },

            // Find all the nodes in the DOM to apply this to
            targets: function () {
                return $('.component--hello-label');
            },

            // Return an array to detect state changes on the component
            state: function (ref) {
                return [ref.model.value]
            },

            // Update the component from the model
            update: function (ref) {
                ref.view.target.html(ref.model.value);
            },

            // Invoke this setup on each component instance
            instance: function (ref) {
                ref.view.target = $(ref.root).find('.target');
                ref.model.value = ref.view.target.html();
            }
        });
    });
})({
    styles: ".component--hello-label > div { padding: 10px 10px 5px 3px; font-family: serif; text-transform: capitalize; font-size: 1.4em; } .component--hello-label > div { border-bottom: 2px solid #efefef; }",
    markup: "<div class='target'>{{data.data-value}}</div>"
});