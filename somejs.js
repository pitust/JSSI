let _v1 = __varset("0", 0, "0");

_v1 = __varset("0", 3, "1");

function y(mysteriousArg) {
    __funcCalled(this, arguments.callee, arguments);
    return 3;
}

y(_v1);