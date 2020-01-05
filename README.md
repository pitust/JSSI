# JSSI
JSSI is a TypeScript to JavaScript compiler.

## Installation
Make sure you have node.js installed
```sh
git clone https://github.com/pitust/jssi
cd jssi
npm install
npm link
```
## How does it work?
It works by removing some JS constructs, such as loops, adding variable and function call tracers.
So for example this:
```js
let i = 0;
export function randomCall() {
  out(i++);
}
out(2);
randomCall();
```
is transpiled to this (without prepended libJSSI, the runtime):
```js
let i = __varset("0", 0, "0");

function randomCall() {
  let __intcfncid = __funcCalled(this, 0x0, arguments);
  out(i++);
  __returning(__intcfncid);
}

out(2);
randomCall();
__passRetev({vm, fnm});
```
__passRetev is defined in interp.js
Note that by the `i++` there is no __varset. This is because pre- and post- incrimination HAVE to input numbers, so their result HAS to be number.
## Usage
```
Usage: jssi <input> [flags]
    Flags:
        -o, --output <output>     Output File
        -D, --defs <deffile>      Definiton File
        -T, --typemap <typemap>   Type Map
        -E, --save-sandbox        Print code sent to the sandbox
```
Input and Output are fairly self-explanatory.
Definition file is YAML with following contents:
```yaml
<function name>:
  args:
    - <type> <name>
  rets: <return type>
```
The type map is JSON:
```json
{
    "types": {
        // Here key is the source type and value is mapped type
    },
    // The prefix and suffix is ignored for undefined
    "suffix": " | null",
    "prefix": ""
}
```
The Save Sandbox option will save the code executed in the sandbox to a file. The file name is determined by removing the file  extension and adding `.sbx.js`.