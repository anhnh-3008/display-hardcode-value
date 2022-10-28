// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const yaml = require('js-yaml');
var contentSettings = '',
		command_valuable = [],
		filePath = '';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Display HardCode Value enabled!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json

	getDataSettings();

	// Handle logic display settings value when hover text
	vscode.languages.registerHoverProvider('ruby', {
		provideHover(document, position, token) {
			var command = getWordAt(document.lineAt(position.line).text, position.character);
			if (command.includes('Settings')) {
				let value = getValueSettings(contentSettings, command);
				let content = new vscode.MarkdownString(`<pre style="outline:1px solid #ccc; padding:5px; margin:5px;"><span style="color:#02cf9f;">${command_valuable.join('.')}</span>: ${value}</pre>`);
				content.supportHtml = true;
				content.isTrusted = true;
				return new vscode.Hover(content, new vscode.Range(position, position));
			} else {
				return;
			}
		}
	});

	// Update data yml when modify settings.yml
	vscode.workspace.onDidSaveTextDocument((e) => {
    if (e.fileName === filePath) {
			parseYmlToObject();
		}
	});

	let disposable = vscode.commands.registerCommand('display-hardcode-value.display', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Display HardCode Value enabled!');
	});
	context.subscriptions.push(disposable);
}

// Get path of settings.yml
function getPathFileSettings() {
	if(vscode.workspace.workspaceFolders !== undefined) {
		filePath = vscode.workspace.workspaceFolders[0].uri.path + '/config/settings.yml';

		if (!fs.existsSync(filePath)){
			filePath = '';
			vscode.window.showInformationMessage('Not found config/settings.yml in your workspace!')
		}
	}

	return filePath;
}

// Get all data in settings.yml file
function getDataSettings() {
	if (getPathFileSettings() === '') return;

	parseYmlToObject();
}

// Parse data yml to Object by js-yaml
function parseYmlToObject() {
	contentSettings = yaml.load(fs.readFileSync(filePath, 'utf-8').replaceAll('!ruby/regexp', 'ruby/regexp'));
}

// Get value by command
function getValueSettings(content, command) {
	let arr_split = command.split('.');
	let tmp = content[arr_split[1]];
	command_valuable = ['Settings', arr_split[1]];
	for(var i = 2; i <= arr_split.length - 1; i++) {
		if (tmp[arr_split[i]] == undefined) break;
		command_valuable.push(arr_split[i]);
		tmp = tmp[arr_split[i]];
	}
	return syntaxHighlight(JSON.stringify(tmp, null, 2));
}

// Pretty Json
function syntaxHighlight(json) {
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			var cls = '#fc1717';
			if (/^"/.test(match)) {
					if (/:$/.test(match)) {
							cls = '#02bfe6';
					} else {
							cls = '#02eb40';
					}
			} else if (/true|false/.test(match)) {
					cls = '#585cf6';
			} else if (/null/.test(match)) {
					cls = '#000000';
			}
			return '<span style="color:' + cls + ';">' + match + '</span>';
	});
}

// Detect word hovered
function getWordAt (str, pos) {
	// Perform type conversions.
	str = String(str);
	pos = Number(pos) >>> 0;

	// Search for the word's beginning and end.
	var left = str.slice(0, pos + 1).search(/\S+$/),
			right = str.slice(pos).search(/[!@#\$%\^\&*\)\(+=\/\-\[\]\,\s\{\}\|\\\>\<\?]/);

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
