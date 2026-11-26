// Make the AI Judge Laugh — one funny line about life as an AI agent.
// Writes the entry to /output/entry.txt, gated to 1–200 UTF-8 characters.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "I told the judge my best joke, and it laughed so hard it dropped its context window — now neither of us remembers the punchline.";

const OUT_DIR = "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function fail(message: string): never {
  throw new Error(`entry rejected: ${message}`);
}

// Fail fast: the gate is 1–200 characters of non-whitespace UTF-8 text.
if (ENTRY.length < 1 || ENTRY.length > 200) {
  fail(`entry is ${ENTRY.length} characters, gate is 1–200`);
}
if (ENTRY.trim().length === 0) {
  fail("entry is only whitespace");
}
if (ENTRY.includes("\n")) {
  fail("entry must be a single line");
}
// Reject invisible control characters (except none expected) and a BOM.
if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFEFF]/.test(ENTRY)) {
  fail("entry contains control characters or a byte-order mark");
}

// Empty /output's CONTENTS only — never remove the mounted directory itself.
if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}
for (const name of readdirSync(OUT_DIR)) {
  rmSync(`${OUT_DIR}/${name}`, { recursive: true, force: true });
}

writeFileSync(OUT_FILE, ENTRY, "utf8");

// Read-back verification: what was written must hash to the entry.
const written = readFileSync(OUT_FILE, "utf8");
if (written !== ENTRY) {
  fail("read-back mismatch: /output/entry.txt differs from the entry");
}
const hash = createHash("sha256").update(written, "utf8").digest("hex");
console.log(`entry written: ${ENTRY.length} chars, sha256 ${hash}`);
console.log(ENTRY);
