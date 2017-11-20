/*! 
 *  \brief     Download Processor
 *  \details   This extension allows automatic processing of file downloads.
 *  \author    Thomas Irgang
 *  \version   1.0
 *  \date      2017
 *  \copyright MIT License
 Copyright 2017 Thomas Irgang

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var api = browser;

/*! known rules */
var rules = [];

/*! Callback for save button. Update rule and save rules. */
function updateRule() {
    var index = this.value;
    console.log("Update rule " + index);
    rules[index].enabled = document.getElementById('rule_enabled_' + index).checked;
    rules[index].pattern = document.getElementById('rule_pattern_' + index).value;
    rules[index].file_pattern = document.getElementById('rule_file_' + index).value;
    rules[index].target = document.getElementById('rule_target_' + index).value;
    rules[index].args = document.getElementById('rule_args_' + index).value;

    saveRules();

    console.log(JSON.stringify(rules[index]));
}

/*! Callback for delete button. Remove a rule and save. */
function deleteRule() {
    var index = this.value;
    console.log("Delete rule " + index);
    var new_rules = [];
    for (var i = 0; i < rules.length; i++) {
        if (i != index) {
            new_rules.push(rules[i]);
        }
    }
    rules = new_rules;
    renderRules();
    saveRules();
}

/*! Rebuild rules table. */
function renderRules() {
    var rules_table = document.getElementById('rules');

    // remove ruls
    while (rules_table.children.length > 1) {
        rules_table.removeChild(rules_table.children[rules_table.children.length - 1])
    }

    // add rules
    for (var i = 0; i < rules.length; ++i) {
        var rule = rules[i];

        console.log("Render rule" + i + ": " + JSON.stringify(rule));

        var row = document.createElement('tr');
        var col_enabled = document.createElement('td');
        col_enabled.style = 'text-align: center;';
        var col_pattern = document.createElement('td');
        var col_file = document.createElement('td');
        var col_target = document.createElement('td');
        var col_args = document.createElement('td');
        var col_delete = document.createElement('td');
        var col_save = document.createElement('td');

        var checkbox = document.createElement('input');
        checkbox.checked = rule.enabled;
        checkbox.type = 'checkbox';
        checkbox.id = 'rule_enabled_' + i;
        col_enabled.appendChild(checkbox);
        row.appendChild(col_enabled);

        var text_pattern = document.createElement('input');
        text_pattern.value = rule.pattern;
        text_pattern.type = 'input';
        text_pattern.id = 'rule_pattern_' + i;
        col_pattern.appendChild(text_pattern);
        row.appendChild(col_pattern);
        
        var text_file = document.createElement('input');
        text_file.value = rule.file_pattern;
        text_file.type = 'input';
        text_file.id = 'rule_file_' + i;
        col_file.appendChild(text_file);
        row.appendChild(col_file);

        var text_target = document.createElement('input');
        text_target.value = rule.target;
        text_target.type = 'input';
        text_target.id = 'rule_target_' + i;
        col_target.appendChild(text_target);
        row.appendChild(col_target);

        var text_args = document.createElement('input');
        text_args.value = rule.args;
        text_args.type = 'input';
        text_args.id = 'rule_args_' + i;
        col_args.appendChild(text_args);
        row.appendChild(col_args);

        var btn_delete = document.createElement('button');
        btn_delete.onclick = deleteRule;
        btn_delete.innerText = "X";
        btn_delete.id = "del_" + i;
        btn_delete.value = i;
        col_delete.appendChild(btn_delete);
        row.appendChild(col_delete);

        var btn_save = document.createElement('button');
        btn_save.onclick = updateRule;
        btn_save.innerText = "Save";
        btn_save.id = "save_" + i;
        btn_save.value = i;
        col_save.appendChild(btn_save);
        row.appendChild(col_save);

        rules_table.appendChild(row);
    }
}

/*! Callback for add button. Create a new rule. */
function addRule() {
    console.log("Add rule");
    var rule = {};
    rule.enabled = true;
    rule.pattern = document.getElementById('pattern').value;
    rule.file_pattern = document.getElementById('file').value;
    rule.target = document.getElementById('target').value;
    rule.args = document.getElementById('arguments').value;

    console.log(JSON.stringify(rule));

    rules.push(rule);
    renderRules();
    saveRules();
}

/*! Load rules from browser persistence. */
function loadRules() {
    console.log("load rules");
    api.storage.local.get("rules", (data) => {
        rules = api.runtime.lastError ? [] : data["rules"];
        if (!rules) {
            rules = [];
        }
        console.log("Loaded rules: " + JSON.stringify(rules));
        renderRules();
    });
}

/*! Save rules to browser persistence and trigger update of background job. */
function saveRules() {
    console.log("Save rules");
    var data = {};
    data["rules"] = rules;
    api.storage.local.set(data, () => {
        if (api.runtime.lastError) {
            console.log("Save error!");
        } else {
            console.log("Rules saved.");
        }
        api.runtime.sendMessage({
            "kind": "rules_updated",
            "rules": rules
        });
    });
}

/*! Setup page and callbacks. */
function setup() {
    loadRules();

    document.getElementById('add').onclick = addRule;
    document.getElementById('refresh').onclick = loadRules;

    console.log("Options loaded.");
}

window.onload = setup;
