let vm2 = require('vm2');
let fs = require('fs');
let libjssi = fs.readFileSync('./libjssi.js', { encoding: 'utf8' });

function retevFromJS(js, defs) {
    let genFullJS = defs + '\n' + libjssi + '\n' + js + '\n__passRetev({vm, fnm});';
    let s = new vm2.VMScript(genFullJS);
    let retevSvd;
    let vm = new vm2.VM({
        sandbox: {
            __passRetev(retev) {
                retevSvd = retev;
            }
        }
    });
    vm.run(s);
    return retevSvd;
}
module.exports = retevFromJS;