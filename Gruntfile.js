module.exports = function (grunt) {

    // Extension glue
    var config = {};
    var extend = function(destination, source) { for (var property in source) { if (destination.hasOwnProperty(property)) { extend(destination[property], source[property]); } else { destination[property] = source[property]; } } return destination; };
    var configure = function(source) { extend(config, source); };

    // Tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-ts');

    // Common
    configure({
        clean: {
            src: ['dist/**/*.js.map', 'dist/**/*.js', 'dist/**/*.d.ts']
        }
    });

    // Library
    configure({
        ts: {
            lib: {
                src: ['src/core/**/*.ts'],
                outDir: 'dist/',
                options: {
                    module: 'commonjs',
                    target: 'es3',
                    sourceMaps: true,
                    declaration: true,
                    removeComments: false
                }
            }
        },
        watch: {
            lib: {
                files: ['src/core/**/*.ts'],
                tasks: ['ts:lib'],
                options: {
                    spawn: false,
                }
            }
        }
    });

    // XQ
    configure({
        ts: {
            xq: {
                src: ['src/xq/**/*.ts'],
                outDir: 'dist/xq',
                options: {
                    module: 'commonjs',
                    target: 'es3',
                    sourceMaps: true,
                    declaration: true,
                    removeComments: false
                }
            }
        },
        watch: {
            xq: {
                files: ['src/xq/**/*.ts'],
                tasks: ['ts:xq'],
                options: {
                    spawn: false,
                }
            }
        }
    });

    // Tests
    configure({
        ts: {
            tests: {
                src: ['src/tests/**/*.ts'],
                out: 'dist/_tests.js',
                options: {
                    target: 'es3',
                    sourceMaps: true,
                    declaration: true,
                    removeComments: false
                }
            }
        },
        shell: {
            tests: {
                options: {
                    stdout: true,
                    stderr: true,
                    execOptions: {
                        cwd: 'dist'
                    }
                },
                command: 'node _tests.js'
            }
        },
        watch: {
            tests: {
                files: ['src/**/*.ts'],
                tasks: ['_tests'],
                options: {
                    spawn: false,
                }
            }
        }
    });

    // Load combined config
    grunt.initConfig(config);

    // Builder tasks
    grunt.registerTask('_tests', ['_lib', 'ts:tests', 'shell:tests']);
    grunt.registerTask('_lib', ['ts:xq', 'ts:lib']);

    // External tasks
    grunt.registerTask('default', ['clean', '_lib']);
    grunt.registerTask('test', ['clean', '_tests']);
}
