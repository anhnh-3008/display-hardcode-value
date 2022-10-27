// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const yaml = require('js-yaml');
var contentSettings = '';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "test" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json

	if(vscode.workspace.workspaceFolders !== undefined) {
		var filePath = vscode.workspace.workspaceFolders[0].uri.path + '/config/settings.yml';
		contentSettings = yaml.load(fs.readFileSync(filePath, 'utf-8').replaceAll('!ruby/regexp', 'ruby/regexp'));
    console.log(contentSettings);
	} else {
		return;
	}

	vscode.languages.registerHoverProvider('ruby', {
		provideHover(document, position, token) {
			var command = getWordAt(document.lineAt(position.line).text, position.character);
			if (command.includes('Settings')) {
				var content = new vscode.MarkdownString(`<span style="color:red;">Setting value: </span> <span style="color:blue;">${getValueSettings(contentSettings, command)}</span>`);
				return new vscode.Hover(content, new vscode.Range(position, position));
			} else {
				return;
			}
		}
	});

	let disposable = vscode.commands.registerCommand('test.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from test!');
	});
	context.subscriptions.push(disposable);
}

function getValueSettings(content, command) {
	let arr_split = command.split('.');
	let tmp = content[arr_split[1]];
	for(var i =2; i <= arr_split.length - 1; i++) {
		tmp = tmp[arr_split[i]]
	}

	return tmp;
}

function getWordAt (str, pos) {

	// Perform type conversions.
	str = String(str);
	pos = Number(pos) >>> 0;

	// Search for the word's beginning and end.
	var left = str.slice(0, pos + 1).search(/\S+$/),
			right = str.slice(pos).search(/\s/);

	// The last word in the string is a special case.
	if (right < 0) {
			return str.slice(left);
	}

	// Return the word, using the located bounds to extract it from the string.
	return str.slice(left, right + pos);

}


// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
