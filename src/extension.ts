'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "wg-getters-and-setters" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.generateGettersAndSetters', () => {
        // The code you place here will be executed every time your command is executed

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        let selection = editor.selection;
        let text = editor.document.getText(selection);

        if (text.length < 1) {
            vscode.window.showErrorMessage('No selected properties.');
            return;
        }

        try {
            var getterAndSetter = createGetterAndSetter(text);

            editor.edit(
                edit => editor.selections.forEach(
                    selection => {
                        edit.insert(selection.end, getterAndSetter);
                    }
                )
            );
        }
        catch (error) {
            console.log(error);
            vscode.window.showErrorMessage('Something went wrong! Try that the properties are in this format: "private String name;"');
        }
    });

    context.subscriptions.push(disposable);
}

function toCamelCase(str: string) {
    return str.replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1));
}

function createGetterAndSetter(textPorperties: string) {
    let properties = textPorperties.split('\n').map(x => x.replace(':', '')).map(x => x.replace(';', ''));

    let generatedCode = `
`;
    for (let p of properties) {
        while (p.startsWith(" ")) { p = p.substr(1); }
        while (p.startsWith("\t")) { p = p.substr(1); }

        let words = p.split(" ").map(x => x.replace('\r\n', ''));
        let type, attribute, Attribute = "";
        let create = false;

        // if words === ["private", "name:", "string"];
        if (words.length === 3) {
            type = words[2];
            attribute = words[1];
            Attribute = toCamelCase(words[1]);

            create = true;
            // if words !== ["private", "name:", "string"];
        } else {
            vscode.window.showErrorMessage('Something went wrong! Try that the properties are in this format: "private name: string;"');
            generatedCode = ``;
            break;
        }

        if (create) {

            let code =
                `
\tpublic ${(type === "Boolean" || type === "boolean" ? "is" : "get")}${Attribute}(): ${type} {
\t\treturn this.${attribute};
\t}

\tpublic set${Attribute}(${attribute}: ${type}): void {
\t\tthis.${attribute} = ${attribute};
\t}
`;
            generatedCode += code;
        }
    }

    return generatedCode;
}

// this method is called when your extension is deactivated
export function deactivate() {
}