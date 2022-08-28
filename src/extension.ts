import * as vscode from 'vscode';
import { Selection } from 'vscode';

const COMMENT_PATTERN = /^\s*<% if false %>\s+<!--.+?-->\s+<% end %>$/ms;

const toggleComment = (text: string, indent: number) => {
	if (COMMENT_PATTERN.test(text)) {
		const lines = text.split("\n");
		return lines.slice(2, -2).join("\n");
	}

	const whitespace = ' '.repeat(indent);
	return [
		`${whitespace}<% if false %>`,
		`${whitespace}<!--`,
		text,
		`${whitespace}-->`,
		`${whitespace}<% end %>`,
	].join("\n");
};

const includesRuby = (text: string) => {
	return text.match(/<%[=\s]/);
};

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerTextEditorCommand('erb-toggle-comment.toggle', (editor, edit) => {
		if (editor.selections.every(selection => !includesRuby(editor.document.getText(selection)))) {
			vscode.commands.executeCommand('editor.action.commentLine');
			return;
		}

		const endLine = editor.selection.end.character === 0 ? editor.selection.end.line - 1 : editor.selection.end.line;
		const endPosition = editor.document.lineAt(endLine).range.end;
		const newSelection = new Selection(new vscode.Position(editor.selection.start.line, 0), endPosition);
		const indent = editor.document.lineAt(newSelection.start.line).firstNonWhitespaceCharacterIndex;
		edit.replace(newSelection, toggleComment(editor.document.getText(newSelection), indent));
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
