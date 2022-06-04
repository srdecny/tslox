import { readFileSync } from "fs";
import * as readline from "node:readline";
import { scan } from "./scanner";

const run = (source: string): void => {
  console.log(scan(source));
};

const runFile = (file: string) => {
  const sourceCode = readFileSync(file, "utf8");
  run(sourceCode);
};

const runPrompt = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on("line", (line) => run(line));
};

const main = () => {
  const args = process.argv.slice(2);
  if (args.length > 1) {
    console.log("Usage: ts-node lox.ts <script>");
    process.exit(64);
  }

  if (args.length === 1) {
    runFile(args[0]);
  } else {
    runPrompt();
  }
};

main();
