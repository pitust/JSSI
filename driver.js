global.globalThis = global;

let parser = require('@babel/parser');
let generator = require('@babel/generator');
let vaf = require('./varAndFunc');
let typeWriter = require('./typeWriter');
let interp = require('./interp');
let tsdef = require('./tsdef');
let fs = require('fs');
let sw = require('./cli');
let ast = parser.parse(fs.readFileSync(sw.input, { encoding: 'utf8' }), {
    plugins: ['typescript'],
    sourceType: "module"
});
let ast2 = JSON.parse(JSON.stringify(ast));
let vafInfo = (vaf(ast, ast2));
let js = (generator.default(vafInfo.ast).code);
let { ts: tsDefs, js: jsMocks } = tsdef(sw.defs);
let interpResult = interp(js, jsMocks);
typeWriter(interpResult, vafInfo);
let out = (tsDefs + '\n' + generator.default(ast2).code);
fs.writeFileSync(sw.out, out);