import { Token, Error, TokenType } from "./types";

interface ScanResult {
  tokens: Token[];
  errors: Error[];
}

interface ScanTokenSuccess {
  kind: "success";
  token: Token;
}

interface ScanTokenError {
  kind: "error";
  error: Error;
}

type ScanTokenResult = ScanTokenSuccess | ScanTokenError;

const keywords: { [key: string]: TokenType } = {
  and: TokenType.AND,
  class: TokenType.CLASS,
  else: TokenType.ELSE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  if: TokenType.IF,
  nil: TokenType.NIL,
  or: TokenType.OR,
  print: TokenType.PRINT,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  true: TokenType.TRUE,
  var: TokenType.VAR,
  while: TokenType.WHILE,
};

export const scan = (source: string): ScanResult => {
  let current = 0;
  let start = 0;
  let line = 1;

  let tokens: Token[] = [];
  let errors: Error[] = [];

  const isDigit = (c: string) => /[0-9]/.test(c);
  const isAlpha = (c: string) => /[a-zA-Z_]/.test(c);
  const isAlphaNumeric = (c: string) => isAlpha(c) || isDigit(c);

  const isAtEnd = () => current >= source.length;
  const advance = () => source[current++];
  const peek = () => (isAtEnd() ? "\0" : source[current]);
  const peekNext = () =>
    current + 1 >= source.length ? "\0" : source[current + 1];
  const match = (expected: string) => {
    if (expected.length + current > source.length) return false;
    const isMatch =
      source.substring(current, current + expected.length) === expected;
    return (isMatch && ((current += expected.length), true)) || false;
  };

  const scanString = (): ScanTokenResult => {
    let str = "";
    while (peek() !== '"' && !isAtEnd()) {
      if (peek() === "\n") line++;
      str += advance();
    }
    if (isAtEnd()) {
      return {
        kind: "error",
        error: {
          line,
          message: "Unterminated string.",
        },
      };
    }
    advance(); // closing ""
    return {
      kind: "success",
      token: {
        type: TokenType.STRING,
        lexeme: str,
        literal: str,
        line,
      },
    };
  };

  const scanMultilineComment = (): ScanTokenError | undefined => {
    while (!isAtEnd()) {
      if (peek() == "\n") line++;
      if (peek() == "*" && peekNext() == "/") {
        current += 2;
        return undefined;
      }
      advance();
    }
    return {
      kind: "error",
      error: {
        line,
        message: "Unterminated multiline comment.",
      },
    };
  };

  const scanIdentifier = (initialChar: string): ScanTokenResult => {
    while (isAlphaNumeric(peek())) initialChar += advance();
    if (keywords.hasOwnProperty(initialChar)) {
      return {
        kind: "success",
        token: {
          type: keywords[initialChar],
          lexeme: initialChar,
          literal: null,
          line,
        },
      };
    } else {
      return {
        kind: "success",
        token: {
          type: TokenType.IDENTIFIER,
          lexeme: initialChar,
          literal: null,
          line,
        },
      };
    }
  };

  const scanNumber = (initialDigit: string): ScanTokenResult => {
    while (isDigit(peek())) initialDigit += advance();
    if (peek() === ".") {
      if (isDigit(peekNext())) {
        initialDigit += advance();
        while (isDigit(peek())) initialDigit += advance();
      } else {
        return {
          kind: "error",
          error: {
            line,
            message: "Invalid number.",
          },
        };
      }
    }
    const num = parseFloat(initialDigit);
    console.log(num);

    return {
      kind: "success",
      token: {
        type: TokenType.NUMBER,
        lexeme: initialDigit,
        literal: num,
        line,
      },
    };
  };

  const scanToken = (): ScanTokenResult => {
    let c = "";
    const prepareToken = (type: TokenType) => {
      return {
        kind: "success",
        token: {
          type,
          lexeme: c,
          literal: null,
          line,
        },
      } as ScanTokenSuccess;
    };
    while (true) {
      c = advance();
      switch (c) {
        case "(":
          return prepareToken(TokenType.LEFT_PAREN);
        case ")":
          return prepareToken(TokenType.RIGHT_PAREN);
        case "{":
          return prepareToken(TokenType.LEFT_BRACE);
        case "}":
          return prepareToken(TokenType.RIGHT_BRACE);
        case ",":
          return prepareToken(TokenType.COMMA);
        case ".":
          return prepareToken(TokenType.DOT);
        case "-":
          return prepareToken(TokenType.MINUS);
        case "+":
          return prepareToken(TokenType.PLUS);
        case ";":
          return prepareToken(TokenType.SEMICOLON);
        case "*":
          return prepareToken(TokenType.STAR);
        case "!":
          return match("=")
            ? prepareToken(TokenType.BANG_EQUAL)
            : prepareToken(TokenType.BANG);
        case "=":
          return match("=")
            ? prepareToken(TokenType.EQUAL_EQUAL)
            : prepareToken(TokenType.EQUAL);
        case "<":
          return match("=")
            ? prepareToken(TokenType.LESS_EQUAL)
            : prepareToken(TokenType.LESS);
        case ">":
          return match("=")
            ? prepareToken(TokenType.GREATER_EQUAL)
            : prepareToken(TokenType.GREATER);
        case "/":
          if (match("/")) {
            while (peek() !== "\n" && !isAtEnd()) advance();
            break; // Comment discarded, scan again
          } else if (match("*")) {
            const maybeError = scanMultilineComment();
            maybeError && errors.push(maybeError.error);
            break;
          } else {
            return prepareToken(TokenType.SLASH);
          }
        case '"':
          return scanString();
        // WHITESPACE
        case "\r":
        case "\t":
        case " ":
          break;
        case "\n":
          line++;
          break;
        default:
          if (isDigit(c)) {
            return scanNumber(c);
          }
          if (isAlpha(c)) {
            return scanIdentifier(c);
          }

          return {
            kind: "error",
            error: {
              line,
              message: `Unexpected character.`,
              where: c,
            },
          } as ScanTokenError;
      }
    }
  };

  while (!isAtEnd()) {
    const maybeToken = scanToken();
    if (maybeToken.kind === "success") {
      tokens.push(maybeToken.token);
    } else {
      errors.push(maybeToken.error);
    }
  }

  tokens.push({ type: TokenType.EOF, lexeme: "", literal: null, line });

  return {
    tokens,
    errors,
  };
};
