const vscode = require('vscode');
var request = require('request');
const jsdom = require("jsdom");
const {
    JSDOM
} = jsdom;
const _ = require("lodash");

function activate(context) {

    console.log("Stack Extension Activated")

    let stack = vscode.commands.registerCommand('extension.stackOverflowAnswer', function () {
        var editor = vscode.window.activeTextEditor;
        var selection = editor.document.getText(editor.selection);
        var number = typeof (selection.split("%")[1]) == 'undefined' ? 0 : selection.split("%")[1];
        selection = selection.split("%")[0].replace("#", "%23");
        var url = "http://www.google.com/search?q=site:stackoverflow.com " + selection;
        url = encodeURI(url);
        console.log(url);

        request(url, function (error, response, body) {

            const dom = new JSDOM(body);
            var document = dom.window.document;
            var href = document.querySelector("#search a").href.split("&")[0].substring(7);
            console.log(href);

            request(href, function (error, response, body) {
                const dom = new JSDOM(body);
                var document = dom.window.document;
                var codes = document.querySelectorAll("#answers code");
                var code = document.querySelector("#answers code").innerHTML;
                var bigCode = '';
                codes.forEach((x, i) => {
                    if (i > number) return;
                    if (number > 0) bigCode += "// " + i + "\n";
                    bigCode += x.innerHTML + "\n";
                })
                editor.edit(x => {
                    x.delete(editor.selection)
                    x.insert(editor.selection.start, _.unescape(bigCode))
                });
            });

        });

    })

    context.subscriptions.push(stack);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;