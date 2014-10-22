'use strict';
var ext = require('./.gruntExt');
module.exports = function (grunt) {

    // Common
    ext.configure({
        path: {
            src: 'src/iwc',
            tmp: 'dist/iwc',
            dist: 'dist/iwc.js'
        },
        clean: {
            src: ['dist/iwc/*', 'dist/iwc.js']
        }
    });

    // Library
    ext.configure({
        typescript: {
            lib: {
                src: ['<%= path.src %>/**/*.ts'],
                dest: '<%= path.tmp %>',
                options: {
                    module: 'commonjs',
                    target: 'es3',
                    sourceMap: true,
                    declaration: true,
                }
            }
        },
        nodeunit: {
            lib: '<%= path.tmp %>/**/*_tests.js'
        },
        browserify: {
            lib: {
                files: {
                    '<%= path.dist %>': ['<%= path.tmp %>/**/*.js', '!**/*_tests.js']
                }
            }
        },
        uglify: {
            lib: {
                files: {
                    'dist/iwc.min.js': 'dist/iwc.js'
                }
            }
        }
    });
    ext.registerTask('_lib', ['typescript:lib', 'nodeunit:lib', 'browserify:lib', 'uglify']);

    // Dev
    ext.configure({
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
                    spawn: true
                }
            }
        }
    });
    ext.registerTask('_dev', ['connect', 'watch']);

    // Tasks
    ext.initConfig(grunt);
    grunt.registerTask('default', ['clean', '_lib']);
    grunt.registerTask('dev', ['default', '_dev']);
}
