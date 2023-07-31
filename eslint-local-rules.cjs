// This file contains custom ESLint rules for this projet,
// loaded by the 'eslint-plugin-local-rules' plugin
// It needs to be CommonJS (.cjs) because that's what ESLint understands

const path = require('path')
const fs = require('fs')
const { isBuiltin } = require('module')

module.exports = {
  'no-unknown-import': {
    create(context) {
      const packageDir = process.cwd()

      const pkg = JSON.parse(
        fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')
      )
      const dependencies = pkg?.dependencies ?? {}

      /**
       * Get the package name from an import path
       *
       * @param path The encountered import path
       */
      function getPackageName(path) {
        const [namespace, name] = path.split('/')
        return namespace.startsWith('@') ? `${namespace}/${name}` : namespace
      }

      function handleNode(node) {
        if (!node.source) return
        if (node.source.value.startsWith('.')) return

        const importKind = node?.importKind ?? 'value'

        const packageName = getPackageName(node.source.value)
        const isInDependencies = packageName in dependencies
        const isNodeModule = isBuiltin(packageName)
        const isImportedType =
          importKind === 'type' &&
          `@types/${
            packageName.startsWith('@')
              ? packageName.slice(1).replaceAll('/', '__')
              : packageName
          }` in dependencies

        if (!isInDependencies && !isNodeModule && !isImportedType) {
          context.report({
            node: node,
            message: `Imported undeclared dependency "${packageName}"`
          })
        }
      }

      return {
        ImportExpression: handleNode,
        ImportDeclaration: handleNode,
        ExportAllDeclaration: handleNode,
        ExportNamedDeclaration: handleNode
      }
    }
  }
}
