// JSSI injected code
let g = typeof window === 'undefined' ? (typeof global === 'undefined' ? globalThis : global) : window;
let fnm = {};
let vm = {};
let beterm = false;
function getType(val) {
    if (val === null) return 'Object';
    if (typeof val != 'object' && typeof val != 'function') return (typeof val);
    if (typeof val == 'function') return val.__funcType;
    if (val == g) return 'globalThis';
    if (val instanceof Array) {
        return getType(val[0]) + '[]';
    } else {
        return Object.getPrototypeOf(val).constructor.name;
    }
}
function __varset(varID, varVal, asgID) {
    let T = getType(varVal);
    if (vm[varID] != T && vm[varID]) {
        beterm = true;
        throw JSON.stringify({ asgID, xpc: vm[varID], gt: T });
    }
    vm[varID] = T;
    return varVal;
}
function handleCatch(varID, e) {
    if (beterm) throw e;
    vm[varID] = e;
}
let callInfo = {}, callCount = 0;
function __funcCalled(thisArg, funcId, params) {
    let ccid = callCount++;
    callInfo[ccid] = {
        thisArg: getType(thisArg),
        params: [...params].map(getType),
        fntp: funcId
    };
    return ccid;
}
function __returning(fHnd, retv) {
    let { thisArg, params, fntp } = callInfo[fHnd];
    fnm[fntp] = {
        thisArg,
        params,
        rets: getType(retv)
    }
    return retv;
}