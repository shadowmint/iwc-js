require.config({
    paths: {
        iwc: '../../dist/iwc',
        handlebars: 'lib/handlebars/handlebars.amd',
        jquery: 'lib/jquery/dist/jquery'
    }
});

define(['./hello-button', './hello-label'], function () {
    console.log('loaded all components');
});
