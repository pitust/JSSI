let { types, suffix, prefix } = require('./cli').typeMap;
let fs = require('fs');
function tJSToTS(T) {
    let realT = (types[T] || T);
    if (T != "undefined") {
        realT = prefix + realT + suffix;
    }
    return realT;
}
function loadDef(defs) {
    let funcs = Object.keys(defs);
    let fdefs = [];
    let jsfdefs = [];
    let jstype = {
        'number': '42',
        'string': '"abc"',
        'boolean': 'true',
        'undefined': 'undefined',
        'Object': 'null',
    }
    for (let func of funcs) {
        let finfo = defs[func];
        let argTbl = [];
        let argPrv = [], i = 0;
        finfo.args = finfo.args || [];
        finfo.rets = finfo.rets || 'undefined';
        for (let p of finfo.args) {
            let xx = p.trim().split(' ');
            let aname = xx.pop();
            let type = xx.join(' ').trim();
            argPrv.push(`\tif (getType(arg${i}) != ${JSON.stringify(type)}) throw new TypeError("CT=${type} GT=" +getType(arg${i}) );\n`);
            argTbl.push(`${aname}: ${tJSToTS(type)}`);
            i++;
        }
        let args = argTbl.join(', ');
        let jsargs = argTbl.map((_, i) => `arg${i}`).join(', ');
        let jsfunc = `function ${func}(${jsargs}) {\n${argPrv.join('')}\treturn ${jstype[finfo.rets]};\n}`;
        let funcDecl = `declare function ${func}(${args}): ${tJSToTS(finfo.rets)};`;
        fdefs.push(funcDecl);
        jsfdefs.push(jsfunc);
    }
    let ts = fdefs.join('\n');
    let js = jsfdefs.join('\n');
    return { js, ts };
}
module.exports = loadDef;