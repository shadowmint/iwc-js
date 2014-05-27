module.exports = function (grunt) {

    // Extension glue
    var config = {};
    var extend = function(destination, source) { for (var property in source) { if (destination.hasOwnProperty(property)) { extend(destination[property], source[property]); } else { destination[property] = source[property]; } } return destination; };
    var configure = function(source) { extend(config, source); };

    // Tasks
    require('matchdep').filterAll('grunt-*').forEach(function (x) { grunt.loadNpmTasks(x); });

    // Common
    configure({
        clean: {
            src: ['dist/*']
        }
    });

    // Library
    configure({
        ts: {
            lib: {
                src: ['src/iwc/**/*.ts'],
                outDir: 'dist/',
                options: {
                    module: 'amd',
                    target: 'es3',
                    sourceMaps: true,
                    declaration: true,
                    removeComments: false
                }
            }
        },
        watch: {
            lib: {
                files: ['src/iwc/**/*.ts'],
                tasks: ['ts:lib'],
                options: {
                    spawn: false,
                }
            }
        }
    });

    // Load combined config
    grunt.initConfig(config);

    // Builder tasks
    grunt.registerTask('_lib', ['ts:lib']);

    // External tasks
    grunt.registerTask('default', ['clean', '_lib']);
}
