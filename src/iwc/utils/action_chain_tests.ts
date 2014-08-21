import chain = require('./action_chain');
import async = require('./async');

export function test_create(t) {
    var instance = new chain.Actions();
    t.ok(instance);
    t.done();
}

export function test_recursive_command_chain(t) {

    var total = 0;

    var items = (root:any):any[] => {
        if (root.value) {
            var rtn = [];
            var bits = root.value.split(' ');
            for (var i = 0; i < bits.length; ++i) {
                rtn.push({value: bits[i]});
            }
            return rtn;
        }
        return [];
    };

    var item = (root:any, loaded:{(root:any):void}) => {
        total += 1;
        switch (root.value) {
            case '00':
                root.value = '01 01';
                break;
            case '01':
                root.value = '02 02';
                break;
            default:
                root.value = null;
                break;
        }
        async.async(() => { loaded(root); });
    };

    var instance = new chain.Actions();
    instance.item = item;
    instance.items = items;
    instance.push({ value: "00 01 00 02 00" });

    // Expansion:
    // 00          01    00          02 00
    // 01    01    02 02 01    01       01    01
    // 02 02 02 02       02 02 02 02    02 02 02 02
    //
    // total = 25 items
    instance.all(() => {
        t.equals(total, 25);
        t.done();
    });
}
