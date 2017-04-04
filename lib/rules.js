'use strict';

var merge = require('merge');
var searchArray = function (haystack, needle) {
    var i;
    for (i = 0; i < haystack.length; i++) {
        if (haystack[i].indexOf(needle) >= 0) {
            return i;
        }
    }
    return -1;
};

function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}
// requires and returns all modules that match

var rules = requireAll(require.context("./rules", true, /.js$/));

module.exports = function (config) {
    var handlers = [],
        i;
    //
    //  rules = fs.readdirSync(path.join(__dirname, 'rules'));
    //  for (i = 0; i < rules.length; i++) {
    //    rules[i] = path.join(__dirname, 'rules', rules[i]);
    //  }
    //    rules=modules;
    Object.keys(config.rules).forEach(function (ruleName) {
        var fullRule = config.rules[ruleName],
            loadRule,
            severity,
            options,
            ruleSearch;

        if (typeof fullRule === 'number') {
            severity = fullRule;
            options = {};
        } else {
            severity = fullRule[0];
            options = fullRule[1];
        }

        // Only seek out rules that are enabled
        if (severity !== 0) {
            //      var fileName = path.normalize(path.join('/', rule + '.js'));

            //      ruleSearch = searchArray(rules, fileName);
            loadRule = rules.find((rule) => rule.name === ruleName);
            if (loadRule) {

                options = merge.recursive(true, loadRule.defaults, options);

                handlers.push({
                    'rule': loadRule,
                    'severity': severity,
                    'options': options
                });
            } else {
                throw new Error('Rule `' + ruleName + '` could not be found!');
            }
        }
    });

    return handlers;
};