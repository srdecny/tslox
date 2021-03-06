import { LoxObject } from "./objects";

export enum TokenType {
  // Single-character tokens.
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  SEMICOLON,
  SLASH,
  STAR,

  // One or two character tokens.
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,

  // Literals.
  IDENTIFIER,
  STRING,
  NUMBER,

  // Keywords.
  AND,
  CLASS,
  ELSE,
  FALSE,
  FUN,
  FOR,
  IF,
  NIL,
  OR,
  PRINT,
  RETURN,
  SUPER,
  THIS,
  TRUE,
  VAR,
  WHILE,

  EOF,
}
export interface Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
}

export interface Error {
  line: number;
  message: string;
  where?: string;
}


export class ParseError extends Error {
  token: Token;
  constructor(token: Token, message: string) {
    super();
    this.message = message;
    this.token = token;
  }
}

export class LoxRuntimeError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class LoxReturn extends Error {
  value: LoxObject;
  constructor(value: LoxObject) {
    super();
    this.value = value;
  }
}