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

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerTextEditorCommand('erb-toggle-comment.toggle', ({ selection, document }, edit) => {
		const endLine = selection.end.character === 0 ? selection.end.line - 1 : selection.end.line;
		const endPosition = document.lineAt(endLine).range.end;
		const newSelection = new Selection(new vscode.Position(selection.start.line, 0), endPosition);
		const indent = document.lineAt(newSelection.start.line).firstNonWhitespaceCharacterIndex;
		edit.replace(newSelection, toggleComment(document.getText(newSelection), indent));
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
