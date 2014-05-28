module.exports = function (grunt) {

    // Extension glue
    var config = {};
    var extend = function (destination, source) {
        for (var property in source) {
            if (destination.hasOwnProperty(property)) {
                extend(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    };
    var configure = function (source) {
        extend(config, source);
    };

    // Tasks
    require('matchdep').filterAll('grunt-*').forEach(function (x) {
        grunt.loadNpmTasks(x);
    });

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
                outDir: 'dist/iwc/',
                options: {
                    module: 'commonjs',
                    target: 'es3',
                    sourceMaps: true,
                    declaration: true,
                    removeComments: false
                }
            }
        },
        browserify: {
            lib: {
                files: {
                    'dist/iwc.js': ['dist/iwc/**/*.js']
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

    // Demo
    configure({
        requirejs: {
            compile: {
                options: {
                    baseUrl: "demo/js",
                    mainConfigFile: "demo/js/app.js",
                    name: "app",
                    out: "demo/js/app.raw.js"
                }
            }
        }
    })

    // Load combined config
    grunt.initConfig(config);

    // Builder tasks
    grunt.registerTask('_lib', ['ts:lib', 'browserify:lib']);
    grunt.registerTask('_demo', ['_lib', 'requirejs']);

    // External tasks
    grunt.registerTask('default', ['clean', '_lib']);
}
