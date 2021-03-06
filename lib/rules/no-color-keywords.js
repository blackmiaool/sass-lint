'use strict';

var helpers = require('../helpers');

var cssColors = require( '../data/literals.json');

/**
 * Checks if a node's parent is a valid type as we dont want to apply
 * this rule to function names or variable names
 *
 * @param {Object} node - The parent node to test
 * @returns {boolean} Whether the node is a valid type or not
 */
var checkValidParentType = function (node) {
  if (node) {
    return node.type === 'function' || node.type === 'variable';
  }

  return false;
};

module.exports = {
  'name': 'no-color-keywords',
  'defaults': {},
  'detect': function (ast, parser) {
    var result = [];

    ast.traverseByType('value', function (node) {
      node.traverse(function (elem, i, parent) {
        if (elem.type === 'ident' && !checkValidParentType(parent)) {
          var index = cssColors.indexOf(elem.content.toLowerCase());

          if (index !== -1) {
            result = helpers.addUnique(result, {
              'ruleId': parser.rule.name,
              'line': elem.start.line,
              'column': elem.start.column,
              'message': 'Color \'' + elem.content + '\' should be written in its hexadecimal form #' + cssColors[index + 1],
              'severity': parser.severity
            });
          }
        }
      });

    });
    return result;
  }
};
