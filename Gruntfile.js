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

    });

    // Dev
    configure({
        connect: {
            lib: {
                options: {
                    port: 3007,
                    base: '.'
                }
            }
        },
        watch: {
            lib: {
                files: ['src/iwc/**/*.ts'],
                tasks: ['_lib'],
                options: {
                    spawn: false,
                }
            }
        }
    });

    // Load combined config
    grunt.initConfig(config);

    // Builder tasks
    grunt.registerTask('_lib', ['ts:lib', 'browserify:lib']);
    grunt.registerTask('_dev', ['connect', 'watch']);

    // External tasks
    grunt.registerTask('default', ['clean', '_lib']);
    grunt.registerTask('dev', ['default', '_dev']);
}
