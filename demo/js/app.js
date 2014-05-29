require.config({
    baseUrl: '/demo/js/',
    paths: {
        iwc: '../../dist/iwc',
        handlebars: 'lib/handlebars/handlebars.amd',
        jquery: 'lib/jquery/dist/jquery',
        hello_button: 'components/hello-button'
    },
    shim: {
        iwc: {
            exports: 'iwc'
        }
    }
});

require(['hello_button'], function() {
  console.log('loaded');
});
