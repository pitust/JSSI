// Entrypoint
let args = process.argv.slice(2);
let fs = require('fs');
let yaml = require('yaml');
let switches = {
    out: null,
    input: null,
    defs: {},
    typeMap: { prefix: "", suffix: "", types: {} },
    printSbx: false
}
for (let i = 0; i < args.length; i++) {
    if (args[i][0] != '-') {
        switches.input = args[i];
        if (!switches.out) switches.out = switches.input.split('.').slice(0, -1).join('.') + '.ts';
        continue;
    }
    if (args[i] == '-o' || args[i] == '--output') {
        switches.out = args[++i];
        continue;
    }
    if (args[i] == '-D' || args[i] == '--defs') {
        switches.defs = yaml.parse(fs.readFileSync(args[++i], { encoding: 'utf8' }));
        continue;
    }
    if (args[i] == '-T' || args[i] == '--typemap') {
        switches.typeMap = JSON.parse(fs.readFileSync(args[++i], { encoding: 'utf8' }));
    }
    if (args[i] == '-E' || args[i] == '--save-sandbox') {
        switches.saveSbx = switches.input.split('.').slice(0, -1).join('.') + '.sbx.js';
    }
}
if (!switches.input) {
    help()
    process.exit();
}
function help() {
    console.log(`Usage: jssi <input> [flags]
    Flags:
        -o, --output <output>     Output File
        -D, --defs <deffile>      Definiton File
        -T, --typemap <typemap>   Type Map
        -E, --save-sandbox        Print code sent to the sandbox`);
}
module.exports = switches;
require('./driver');