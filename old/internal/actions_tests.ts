import actions = require('./actions');

export function test_invalid_component_names_fail(test) {
  test.throws(() => {
      actions.validate_name('hello')
  }, 'Error', 'Components must be named in the NS-NAME format');
  test.done();
}

export function test_valid_simple_component_names_pass(test) {
  actions.validate_name('ns-name');
  test.done();
}

export function test_valid_complex_component_names_pass(test) {
  actions.validate_name('ns-name-other-part');
  test.done();
}
