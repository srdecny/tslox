import { readFileSync } from "fs";
import * as readline from "node:readline";
import { scan } from "./scanner";
import { Token } from "./types";
import * as ast from "./ast";
import { parse } from "./parser";
import {execute} from "./interpreter";

const run = (source: string): void => {
  const scanRes = scan(source);
  if (scanRes.errors.length > 0) {
    console.error(scanRes.errors);
    return;
  }
  const ast = parse(scanRes.tokens);
  execute(ast)
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
