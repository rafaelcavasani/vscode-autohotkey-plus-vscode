import * as vscode from "vscode";
import { AhkDefinitionProvider } from "./AhkDefinitionProvider";
import { AhkSignatureHelpProvider } from "./AhkSignatureHelpProvider";
import { FormatProvider } from "./FormatProvider";
import { SymBolProvider } from "./SymbolProvider";
import { initLogging, log } from "./vcore";

export function activate(context: vscode.ExtensionContext) {
    const channel = vscode.window.createOutputChannel("ahk");
    initLogging(channel);

    vscode.languages.registerDocumentSymbolProvider({ language: "ahk" }, new SymBolProvider());
    vscode.languages.registerDocumentFormattingEditProvider({ language: "ahk" }, new FormatProvider());

    const ds = { language: "ahk" };

    vscode.languages.registerDocumentSymbolProvider(ds, new SymBolProvider());
    vscode.languages.registerDocumentFormattingEditProvider(ds, new FormatProvider());

    const dp = new AhkDefinitionProvider();
    const dpHandle = vscode.languages.registerDefinitionProvider(ds, dp);
    context.subscriptions.push(dpHandle);

    log("registering signature help provider");
    const sigHp = new AhkSignatureHelpProvider();
    const sigHpHandle = vscode.languages.registerSignatureHelpProvider(ds, sigHp, "(", ",");
    context.subscriptions.push(sigHpHandle);

    log("ahk extension activation complete");
}
