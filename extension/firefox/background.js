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

/*! active rules. */
var rules;

/*! Forward url and target to native component. */
function callForwarder(file, rule) {
    console.log("Send native: " + file);
    api.runtime.sendNativeMessage(
        'eu.irgang.download_processor', {
            "file": file,
            "target": rule.target,
            "args": rule.args
        },
        answerHandler
    );
}

/*! Callback for native component. */
function answerHandler(response) {
    console.log("Received from native: " + JSON.stringify(response));
}

/*! Search for matching rules. */
function findRule(url, file) {
    var matching_rules = rules.filter(function (rule) {
        return url.match(rule.pattern);
    });
    var matching_rules = matching_rules.filter(function (rule) {
        return file.match(rule.file_pattern);
    });

    if (matching_rules.length > 1) {
        console.log("More than one rule match, using fist one.");
        return matching_rules[0];
    } else if (matching_rules.length == 1) {
        return matching_rules[0];
    }
    return null;
}

/*! Check is download affected by a rule. */
function checkUrl(details) {
    if (details) {
        var url = details.url;
        if (url) {
            var rule = findRule(url);
            if (rule) {
                console.log("URL match: " + url);
                callForwarder(url, rule);
                if (rule.action == 0) {
                    console.log("action: stay");
                    if (currentTabUrl) {
                        console.log("Redirect to " + currentTabUrl);
                        return {
                            redirectUrl: currentTabUrl
                        };
                    } else {
                        console.log("No current tab, block instead.");
                        return {
                            cancel: true
                        };
                    }
                } else if (rule.action == 1) {
                    console.log("action: block");
                    return {
                        cancel: true
                    };
                } else {
                    console.log("action: redirect");
                    if (rule.redirect) {
                        console.log("Redirect to " + rule.redirect);
                        return {
                            redirectUrl: rule.redirect
                        };
                    } else {
                        console.log("No redirect URL, block instead.");
                        return {
                            cancel: true
                        };
                    }
                }
            }
        }
    }
    return {
        cancel: false
    };
}

/*! Load available rules from persistence. */
function loadRules() {
    console.log("Load rules");
    api.storage.local.get("rules", (data) => {
        var loaded = api.runtime.lastError ? [] : data["rules"];
        if (!loaded) {
            loaded = [];
        }
        rules = loaded.filter(function (rule) {
            return rule.enabled;
        });
        console.log("Loaded rules: " + JSON.stringify(rules));
    });
}

/*! Register message listener for rule update message. */
api.runtime.onMessage.addListener(function (msg) {
    if (msg) {
        if (msg.kind == "rules_updated") {
            var rec = msg.rules;
            rules = rec.filter(function (rule) {
                return rule.enabled;
            });
            console.log("Received rules: " + JSON.stringify(rules));
        }
    }
});

/*! Register as request listener. */
api.webRequest.onBeforeRequest.addListener(
    checkUrl, {
        urls: ["<all_urls>"]
    }, ["blocking"]
);

//load rules on startup
loadRules();

console.log("Background job started.");
