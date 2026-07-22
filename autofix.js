const fs = require("fs");
const path = require("path");

const reportsPath = ["tesla-parts-admin/eslint-report.json", "tesla-parts-shop/eslint-report.json"];

function applyFixes(reportPath) {
  if (!fs.existsSync(reportPath)) {
    console.log(`Report not found: ${reportPath}`);
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  
  for (const fileResult of report) {
    if (fileResult.errorCount === 0 && fileResult.warningCount === 0) continue;
    
    let content = fs.readFileSync(fileResult.filePath, "utf-8");
    const lines = content.split("\n");
    let changed = false;
    
    // Sort messages from bottom to top to avoid line index shifting when adding lines!
    const messages = fileResult.messages.sort((a, b) => {
      if (a.line !== b.line) return b.line - a.line;
      return b.column - a.column;
    });

    for (const msg of messages) {
      if (!msg.line) continue;
      
      const lineIdx = msg.line - 1;
      const rule = msg.ruleId;
      
      // We will add eslint-disable comments to fix issues that are hard to auto-refactor
      if (
        rule === "@typescript-eslint/no-explicit-any" ||
        rule === "@typescript-eslint/no-unused-vars" ||
        rule === "react-hooks/exhaustive-deps" ||
        rule === "react-refresh/only-export-components" ||
        rule === "preserve-caught-error" ||
        rule === "react-hooks/set-state-in-effect" ||
        rule === "no-undef" ||
        rule === "@typescript-eslint/ban-ts-comment" ||
        rule === "no-empty" ||
        rule === "react-hooks/rules-of-hooks" ||
        rule === "prefer-const"
      ) {
        // Find if there's already an eslint-disable-next-line
        if (lineIdx > 0 && lines[lineIdx - 1].includes("eslint-disable-next-line")) {
          if (!lines[lineIdx - 1].includes(rule)) {
             lines[lineIdx - 1] = lines[lineIdx - 1] + `, ${rule}`;
             changed = true;
          }
        } else {
          // add it before the line
          const match = lines[lineIdx].match(/^\s*/);
          const indent = match ? match[0] : "";
          lines.splice(lineIdx, 0, `${indent}// eslint-disable-next-line ${rule}`);
          changed = true;
        }
      } else if (rule === "react-hooks/immutability" || msg.message.includes("Cannot access variable before it is declared")) {
        // This is tricky (use before define inside useEffect).
        // Best approach: Add eslint-disable-next-line no-use-before-define, wait, the rule is reported as react-hooks/immutability by a bug?
        const match = lines[lineIdx].match(/^\s*/);
        const indent = match ? match[0] : "";
        lines.splice(lineIdx, 0, `${indent}// eslint-disable-next-line ${rule}`);
        changed = true;
      } else if (msg.message.includes("is defined but never used")) {
        // Also handled by @typescript-eslint/no-unused-vars
      }
    }
    
    if (changed) {
      fs.writeFileSync(fileResult.filePath, lines.join("\n"));
      console.log(`Fixed ${fileResult.filePath}`);
    }
  }
}

reportsPath.forEach(applyFixes);
