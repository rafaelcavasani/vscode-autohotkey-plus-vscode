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
        let lineBreak = true;
        let labelFunction = false;
        let deep = 0;
        const oneCommandList = ["IfNotExist", "IfExist", "IfWinActive", "IfWinNotActive", "IfWinExist", "IfWinNotExist", "IfInString", "IfNotInString", "if", "Else", "Loop", "For", "While"];

        for (let line = 0; line < document.lineCount; line++) {

            const { text } = document.lineAt(line);
            formatedLine = text;
            formatedLine = formatedLine.replace(/^\s+/g, "");
            formatedLine = formatedLine.replace(/\s+$/g, "");

            if (formatedLine.match(/^\}/) !== null) {
                deep -= 4;
                if (deep < 0) {
                    deep = 0;
                }
            }
            if (formatedLine.match(/^(return)/i) && labelFunction === true) {
                deep -= 4;
                labelFunction = false;
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
            pattern = /^((?!(if|else|else if|return|Loop|for|while|try|finallyIfNotExist|IfExist|IfWinActive|IfWinNotActive|IfWinExist|IfWinNotExist|IfInString|IfNotInString))\w+?\s*\(\w*?\)\s*?\{)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = pattern.exec(formatedLine)) {
                const res = result[0].replace(/(\s)*\{/, `\n${" ".repeat(deep)}{`);
                formatedLine = formatedLine.replace(result[0], res);
            }

            // tslint:disable-next-line: max-line-length
            // tslint:disable-next-line: max-line-length
            pattern = /(for\s+\w+\s*,\s*\w+\s+in\s+(\%\s*)?([a-zA-Z0-9\[\]\(\)_\-\.])+\s*\{?)/gi;
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
            // tslint:disable-next-line: max-line-length
            pattern = /(loop\s*(\,\s*(\%\s*)?([a-zA-z0-9().])*)?(\%\s*)?\s*\{?)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = pattern.exec(formatedLine)) {
                let res = result[0].replace(/loop\s*\,\s*/gi, "loop, ");
                res = res.replace(/\b(\,\s*\%\s*)/, ", % ");
                res = res.replace(/\s*\{/, " {");
                formatedLine = formatedLine.replace(result[0], res);
            }

            let noFunctionPattern = /(\}?\s*(else if|if|while)\s?(\(\w*?\))?\s*\{?)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = noFunctionPattern.exec(formatedLine)) {
                let res = result[0].replace(/if\s*\(/gi, "if (");
                res = res.replace(/(\}\s*else\s+if\s*\()/gi, "} else if (");
                res = res.replace(/\b(while\s*\()/gi, "while (");
                res = res.replace(/\b((while\s*)(?!\s+\())/gi, "while ");
                res = res.replace(/(\)\s*\{)/, ") {");
                res = res.replace(/(\s*\{)$/, " {");
                formatedLine = formatedLine.replace(result[0], res);
            }

            noFunctionPattern = /(\}\s*else\s*\{)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = noFunctionPattern.exec(formatedLine)) {
                const res = result[0].replace(/(\}\s*else\s*\{)/gi, "} else {");
                formatedLine = formatedLine.replace(result[0], res);
            }

            noFunctionPattern = /((?!\})\s*else\s*)$/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = noFunctionPattern.exec(formatedLine)) {
                const res = result[0].replace(/(\s*else\s*)/gi, " else");
                formatedLine = formatedLine.replace(result[0], res);
            }

            noFunctionPattern = /(\}\s*catch\s*(,\s*\w*)?\s*\{)/gi;
            result = [];
            // tslint:disable-next-line: no-conditional-assignment
            while (result = noFunctionPattern.exec(formatedLine)) {
                let res = result[0].replace(/(\}\s*catch\s*\{)/gi, "} catch {");
                res = res.replace(/(\}\s*catch\s*\,\s*)/gi, "} catch, ");
                res = res.replace(/(\s*\{)/, " {");
                formatedLine = formatedLine.replace(result[0], res);
            }

            if (lineBreak) {
                formatDocument += " ".repeat(deep) + formatedLine;
            } else {
                if (formatedLine.match(/\s*\{\s*$/) !== null) {
                    formatedLine = formatedLine.replace(/^\s*\{\s*$/, " {");
                    lineBreak = true;
                }
                formatDocument += formatedLine;
            }

            let nextLine = "";
            if (line !== document.lineCount - 1) {
                nextLine = document.lineAt(line + 1).text.toString();
                nextLine = nextLine.replace(/^\s+/g, "");
                nextLine = nextLine.replace(/\s+$/g, "");
            }
            // tslint:disable-next-line: max-line-length
            pattern = /(if\s*(\(.*\))\s*(?!\{))$|(for\s+\w+\s*,\s*\w+\s+in\s+(\%\s*)?([a-zA-Z0-9\[\]\(\)_\-\.])+\s*(?!\{))$|(loop\s*(\,\s*(\%\s*)?([a-zA-z0-9().])*)?(\%\s*)?\s*(?!\{))$|(else\s*(if\s*\(\w*\)\s*)?(?!\{))$|(\}?\s*catch\s*(,\s*\w*)?\s*(?!\{))$|(try\s*(?!\{))$|(while\s*?(\(.*\))?\s*(?!\{))$/gi;
            if ((formatedLine.match(pattern) !== null) || (formatedLine.match(/^\}/) !== null && nextLine.match(/^else/) !== null)) {
                lineBreak = false;
            }
            if (formatedLine.match(/\}$/) !== null && nextLine.match(/^(else|catch)/) !== null) {
                formatedLine = formatedLine + " ";
                lineBreak = false;
            }
            if (formatedLine.match(/(.+::?)$/)) {
                deep += 4;
                labelFunction = true;
            }
            if (formatedLine.match(/^(return)/i) && labelFunction === true) {
                deep -= 4;
                labelFunction = false;
            }
            if (line !== document.lineCount - 1) {
                if (deep < 0) {
                    deep = 0;
                }
                if (formatedLine.match(/\{$/)) {
                    deep += 4;
                }
                if (lineBreak) {
                    formatDocument += "\n";
                }
            }

        }
        const result = [];
        result.push(new vscode.TextEdit(fullDocumentRange(document), formatDocument.replace(/\n{2,}/g, "\n\n")));
        return result;
    }

}
