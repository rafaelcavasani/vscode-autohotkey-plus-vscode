import * as vscode from "vscode";

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

export class FormatProvider implements vscode.DocumentRangeFormattingEditProvider, vscode.DocumentFormattingEditProvider {

    // tslint:disable-next-line: max-line-length
    public provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
        throw new Error("Method not implemented.");
    }

    public provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {

        let formatDocument = "";
        let formatedLine = "";
        let labelFunction = false;
        let deep = 0;
        const oneCommandList = ["IfNotExist", "IfExist", "IfWinActive", "IfWinNotActive", "IfWinExist", "IfWinNotExist", "IfInString", "IfNotInString", "if", "Else", "Loop", "For", "While"];

        for (let line = 0; line < document.lineCount; line++) {

            const { text } = document.lineAt(line);
            formatedLine = text;
            formatedLine = formatedLine.replace(/^\s+/g, "");
            if (formatedLine.match(/^\s*\}/)) {
                deep -= 4;
                if (deep < 0) {
                    deep = 0;
                }
            }

            let pattern = /((class)\s*\w*\s*?\{)/gi;
            // tslint:disable-next-line: no-shadowed-variable
            let result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = pattern.exec(formatedLine)) {
                const res = result[0].replace(/(\s)*\{/, `\n${" ".repeat(deep)}{`);
                formatedLine = formatedLine.replace(result[0], res);
            }

            // tslint:disable-next-line: max-line-length
            pattern = /^((?!(if|else|else if|return|Loop|for|while|try|finallyIfNotExist|IfExist|IfWinActive|IfWinNotActive|IfWinExist|IfWinNotExist|IfInString|IfNotInString))\w+?\s*\(.*?\)\s*?\{)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = pattern.exec(formatedLine)) {
                const res = result[0].replace(/(\s)*\{/, `\n${" ".repeat(deep)}{`);
                formatedLine = formatedLine.replace(result[0], res);
            }

            // tslint:disable-next-line: max-line-length
            pattern = /(for\s+\w+\s*,\s*\w+\s+in\s+.*\s*\{)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = pattern.exec(formatedLine)) {
                let res = result[0].replace(/^for(\s)*/gi, "for ");
                res = res.replace(/\s*\,\s*/, ", ");
                res = res.replace(/\s*in\s*/, " in ");
                res = res.replace(/\s*\{/, " {");
                formatedLine = formatedLine.replace(result[0], res);
            }

            // tslint:disable-next-line: max-line-length
            pattern = /(loop\s*\,\s*\%?\s*.+\s*\{)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = pattern.exec(formatedLine)) {
                let res = result[0].replace(/loop(\s)*/gi, "loop ");
                res = res.replace(/\s*\,\s*/, ", ");
                res = res.replace(/\s*\{/, " {");
                formatedLine = formatedLine.replace(result[0], res);
            }

            if (formatedLine.match(/(.+::?)/)) {
                deep += 4;
                labelFunction = true;
            }
            if (formatedLine.match(/^(return)/) && labelFunction === true) {
                deep -= 4;
                labelFunction = false;
            }

            let noFunctionPattern = /\b((if|while|else if)\s?(\(.*?\))?\s*?\{)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = noFunctionPattern.exec(formatedLine)) {
                let res = result[0].replace(/\b((if)\s*\()/gi, "if (");
                res = res.replace(/(\}\s*else\s+if\s*\()/gi, "} else if (");
                res = res.replace(/(\)\s*\{)/, ") {");
                res = res.replace(/\b((while)\s*\()/gi, "while (");
                formatedLine = formatedLine.replace(result[0], res);
            }

            noFunctionPattern = /(\}\s*(else)\s*\{)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = noFunctionPattern.exec(formatedLine)) {
                const res = result[0].replace(/(\}\s*(else)\s*\{)/gi, "} else {");
                formatedLine = formatedLine.replace(result[0], res);
            }

            noFunctionPattern = /(\}\s*catch\s*(,\s*(%\s*.*))?\s*\{)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = noFunctionPattern.exec(formatedLine)) {
                let res = result[0].replace(/(\}\s*catch\s*\{)/gi, "} catch {");
                res = res.replace(/(\}\s*catch\s*\,)/gi, "} catch, ");
                res = res.replace(/(\s*\{)/, " {");
                formatedLine = formatedLine.replace(result[0], res);
            }

            formatDocument += " ".repeat(deep) + formatedLine;
            if (line !== document.lineCount - 1) {
                if (deep < 0) {
                    deep = 0;
                }
                if (formatedLine.match(/\{$/)) {
                    deep += 4;
                }
                formatDocument += "\n";
            }

        }
        const result = [];
        result.push(new vscode.TextEdit(fullDocumentRange(document), formatDocument.replace(/\n{2,}/g, "\n\n")));
        return result;
    }

}
