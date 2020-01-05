let types = require('@babel/types')
let traverse = require('@babel/traverse')
let allFuncs = {}, fc = 0;
let allVars = {}, vc = 0;
let allAssignLocs = {}, ac = 0;
/**
 * 
 * @param {types.Program} ast 
 */
function doIt(ast, ast2) {
    console.log('Upgrade #1')
    traverse.default(ast, {
        /**
         * 
         * @param {traverse.NodePath<types.ReturnStatement>} path 
         */
        ReturnStatement(path) {
            path.node.argument = types.callExpression(types.identifier('__returning'), [
                types.identifier('__intcfncid'),
                path.node.argument
            ])
        }
    });
    traverse.default(ast, {
        /**
         * 
         * @param {traverse.NodePath<types.Function>} path 
         */
        Function(path) {
            let fid = fc++;
            allFuncs[fid] = path.node;
            path.node.body.body.unshift(types.identifier(`let __intcfncid = __funcCalled(this, 0x${fid.toString(16)}, arguments);`));
            path.node.body.body.push(types.identifier('__returning(__intcfncid);'));
        }
    })
    console.log('Vars')
    traverse.default(ast, {
        /**
         * 
         * @param {traverse.NodePath<types.AssignmentExpression>} path 
         */
        AssignmentExpression(path) {
            if (path.node.left.type != 'Identifier') return;
            /**
             * @type {traverse.NodePath<types.Statement>} stp
             */
            let varID = path.scope.getBinding(path.node.left.name).path.node.__vid;
            let asgID = ac++;
            allAssignLocs[asgID] = path.node.loc.start;
            path.node.right = types.callExpression(types.identifier('__varset'), [
                types.stringLiteral(varID.toString()),
                path.node.right,
                types.stringLiteral(asgID.toString())
            ]);
        },
        /**
         * 
         * @param {traverse.NodePath<types.VariableDeclarator>} path 
         */
        VariableDeclarator(path) {
            let varID = vc++;
            allVars[varID] = path.node;
            path.node.__vid = varID;
            if (path.node.init) {
                let asgID = ac++;
                allAssignLocs[asgID] = path.node.loc.start;
                path.node.init = types.callExpression(types.identifier('__varset'), [
                    types.stringLiteral(varID.toString()),
                    path.node.init,
                    types.stringLiteral(asgID.toString())
                ]);
            }
        }
    });
    console.log('Upgrade #2')
    fc = 0;
    ac = 0;
    vc = 0;
    traverse.default(ast2, {
        /**
         * 
         * @param {traverse.NodePath<types.Function>} path 
         */
        Function(path) {
            let fid = fc++;
            allFuncs[fid] = path.node;
        }
    })
    traverse.default(ast2, {
        /**
         * 
         * @param {traverse.NodePath<types.AssignmentExpression>} path 
         */
        AssignmentExpression(path) {
            if (path.node.left.type != 'Identifier') return;
            let asgID = ac++;
            allAssignLocs[asgID] = path.node.loc.start;
        },
        /**
         * 
         * @param {traverse.NodePath<types.VariableDeclarator>} path 
         */
        VariableDeclarator(path) {
            let varID = vc++;
            allVars[varID] = path.node;
            path.node.__vid = varID;
            if (path.node.init) {
                let asgID = ac++;
                allAssignLocs[asgID] = path.node.loc.start;
            }
        }
    });
    console.log('Simplyfy....');
    traverse.default(ast, {
        /**
         * 
         * @param {traverse.NodePath<types.IfStatement>} path 
         */
        IfStatement(path) {
            let tx = [
                types.expressionStatement(path.node.test)
            ];
            if (path.node.consequent) tx.push(path.node.consequent);
            if (path.node.alternate) tx.push(path.node.alternate);
            path.replaceWithMultiple(tx);
        },
        /**
         * 
         * @param {traverse.NodePath<types.WhileStatement>} path 
         */
        WhileStatement(path) {
            path.replaceWithMultiple([
                path.node.body,
                types.expressionStatement(path.node.test)
            ]);
        },
        /**
         * 
         * @param {traverse.NodePath<types.DoWhileStatement>} path 
         */
        DoWhileStatement(path) {
            path.replaceWithMultiple([
                path.node.body,
                types.expressionStatement(path.node.test)
            ]);
        },
        /**
         * 
         * @param {traverse.NodePath<types.ForStatement>} path 
         */
        ForStatement(path) {
            path.replaceWithMultiple([
                path.node.init,
                types.expressionStatement(path.node.test),
                path.node.update,
                path.node.body
            ]);
        },
        /**
         * 
         * @param {traverse.NodePath<types.ForInStatement>} path 
         */
        ForInStatement(path) {
            let nmid;
            let vts = types.stringLiteral('0');
            let vid;
            switch (path.node.left.type) {
                case 'Identifier':
                case 'MemberExpression':
                case 'ArrayPattern':
                case 'ObjectPattern':
                    nmid = types.assignmentExpression('=', path.node.left, vts);
                    break;
                case 'VariableDeclaration':
                    let decls = path.node.left.declarations;
                    decls[decls.length - 1].init = vts;
                    vid = decls[decls.length - 1].__vid;
                default:
                    nmid = types.noop();
                    break;
            }
            if (vid) {
                let asgID = ac++;
                allAssignLocs[asgID] = path.node.loc.start;
                let vset = types.callExpression(types.identifier('__varset'), [
                    types.stringLiteral(vid.toString()),
                    types.stringLiteral(''),
                    types.stringLiteral(asgID.toString())
                ]);
                path.replaceWithMultiple([
                    path.node.left,
                    nmid,
                    vset,
                    path.node.body
                ]);
            } else {
                path.replaceWithMultiple([
                    path.node.left,
                    nmid,
                    path.node.body
                ]);
            }
        },
        /**
         * 
         * @param {traverse.NodePath<types.ForOfStatement>} path 
         */
        ForOfStatement(path) {
            let nmid;
            let vts = types.memberExpression(path.node.right, types.stringLiteral('0'), true);;
            switch (path.node.left.type) {
                case 'Identifier':
                case 'MemberExpression':
                case 'ArrayPattern':
                case 'ObjectPattern':
                    nmid = types.assignmentExpression('=', path.node.left, vts);
                    break;
                case 'VariableDeclaration':
                    let decls = path.node.left.declarations;
                    decls[decls.length - 1].init = vts;
                default:
                    nmid = types.noop();
                    break;
            }
            path.replaceWithMultiple([
                path.node.left,
                nmid,
                path.node.body
            ]);
        },
        /**
         * 
         * @param {traverse.NodePath<types.SwitchStatement>} path 
         */
        SwitchStatement(path) {
            path.replaceWithMultiple([
                path.node.discriminant,
                ...path.node.cases.map(e => e.consequent)
            ]);
        },
        /**
         * 
         * @param {traverse.NodePath<types.BreakStatement>} path 
         */
        BreakStatement(path) {
            path.replaceWith(types.noop());
        },
        /**
         * 
         * @param {traverse.NodePath<types.ExportDeclaration>} path 
         */
        ExportDeclaration(path) {
            if (path.node.declaration.type == 'ExportAllDeclaration') path.replaceWith(types.noop());
            else if (path.node.declaration.type == 'ExportDefaultDeclaration'
                     || path.node.declaration.type == 'ExportNamedDeclaration') {
                path.replaceWith(path.node.declaration.declaration);
            } else path.replaceWith(path.node.declaration);
        }
    })
    return {
        allFuncs,
        allVars,
        allAssignLocs,
        ast
    }
}
module.exports = doIt;
