const groot = require('./lib/groot');
const helpers = require('./lib/helpers');
const slRules = require('./lib/rules');
const ruleToggler = require('./lib/ruleToggler');
const getToggledRules = ruleToggler.getToggledRules;
const isResultEnabled = ruleToggler.isResultEnabled;

const defaultConfig = {
    "rules": {
        "extends-before-mixins": 2,
        "hex-notation": [
                    2,
            {
                "style": "uppercase"
                    }
                ],
        "placeholder-in-extend": 2,
        "no-warn": 1,
        "no-important": 2,
        "no-ids": 2,
        "property-sort-order": [
                    1,
            {
                "ignore-custom-properties": true,
                "order": [
                            "display",
                            "margin"
                        ]
                    }
                ],
        "mixins-before-declarations": [
                    2,
            {
                "exclude": [
                            "breakpoint",
                            "mq"
                        ]
                    }
                ],
        "no-debug": 1,
        "indentation": [
                    2,
            {
                "size": 2
                    }
                ],
        "extends-before-declarations": 2,
        "variable-for-property": [
                    2,
            {
                "properties": [
                            "margin",
                            "content"
                        ]
                    }
                ]
    },
    "options": {
        "output-file": "linters/sass-lint.html",
        "formatter": "html",
        "max-warnings": 50,
        "merge-default-rules": false
    }
};

function verify(text, options) {
    const baseConfig = JSON.parse(JSON.stringify(defaultConfig));
    if (options) {
        if (options.rules) {
            for (const i in options.rules) {
                baseConfig.rules[i] = options.rules[i];
            }
        }
        if (options.options) {
            for (const i in options.options) {
                baseConfig.options[i] = options.options[i];
            }
        }
    }
    var rules = slRules(baseConfig),
        ast = {},
        detects,
        results = [],
        errors = 0,
        warnings = 0,
        ruleToggles = null,
        isEnabledFilter = null;

    try {
        ast = groot(text, 'scss');
    } catch (e) {
        var line = e.line || 1;
        errors++;

        results = [{
            ruleId: 'Fatal',
            line: line,
            column: 1,
            message: e.message,
            severity: 2
        }];
    }

    if (ast.content && ast.content.length > 0) {
        ruleToggles = getToggledRules(ast);
        isEnabledFilter = isResultEnabled(ruleToggles);

        rules.forEach(function (rule) {
            detects = rule.rule.detect(ast, rule)
                .filter(isEnabledFilter);
            if (detects.length) {
                detects.forEach(function (detect) {                    
                    detect.message+=(" ("+detect.ruleId+")");
                });
                if (rule.severity === 1) {
                    warnings += detects.length;
                    detects.forEach(function (detect) {
                        detect.type = "warning";
                    });
                } else if (rule.severity === 2) {
                    errors += detects.length;
                    detects.forEach(function (detect) {
                        detect.type = "error";
                    });
                }
            }
            results = results.concat(detects);

        });
    }
    results.sort(helpers.sortDetects);
    return {
        'warningCount': warnings,
        'errorCount': errors,
        'messages': results
    };

}
export default {verify};
//modules.exports={verify};