require.config({
    baseUrl: '..',
    paths: {
        iwc: 'dist/iwc',
        handlebars: 'demo/js/lib/handlebars/handlebars.amd',
        jquery: 'demo/js/lib/jquery/dist/jquery',
        hello_button: 'demo/js/components/hello-button'
    }
});

require(['hello_button']);
