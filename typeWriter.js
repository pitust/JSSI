let { types, suffix, prefix } = require('./cli').typeMap;
function typeFactory(T) {
    let realT = (types[T] || T);
    if (T != "undefined") {
        realT = prefix + realT + suffix;
    }
    return {
        type: 'TSTypeAnnotation',
        typeAnnotation: {
            type: 'TSTypeReference',
            typeName: {
                type: 'Identifier',
                name: realT
            }
        }
    };
}

module.exports = function annotate(retev, vafInfo) {

    let { vm, fnm } = retev;
    for (let vardef of Object.keys(vafInfo.allVars)) {
        let t = vm[vardef];
        let astNode = vafInfo.allVars[vardef];
        astNode.id.typeAnnotation = typeFactory(t);
    }
    for (let funcid of Object.keys(vafInfo.allFuncs)) {
        let t = fnm[funcid];
        let astNode = vafInfo.allFuncs[funcid];
        for (let pidx in astNode.params) {
            astNode.params[pidx].typeAnnotation = typeFactory(t.params[pidx]);
        }
        astNode.returnType = typeFactory(t.rets);
    }
}