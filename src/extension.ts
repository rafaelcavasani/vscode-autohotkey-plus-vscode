import * as vscode from "vscode";
import { FormatProvider } from "./FormatProvider";
import { SymBolProvider } from "./SymbolProvider";

export function activate(context: vscode.ExtensionContext) {

    vscode.languages.registerDocumentSymbolProvider({ language: "ahk" }, new SymBolProvider());
    vscode.languages.registerDocumentFormattingEditProvider({ language: "ahk" }, new FormatProvider());

}
