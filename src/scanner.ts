import { Token, Error, TokenType } from "./types"

interface ScanSuccess {
    state: "success",
    tokens: Token[]
}

interface ScanError {
    state: "error",
    error: Error
}

export const scan = (source: string): ScanSuccess | ScanError => {

    let current = 0;
    let start = 0;
    let line = 1;

    let tokens: Token[] = []

    const isAtEnd = () => current >= source.length;

    const advance = () => source[current++];

    const scanToken = (): Token | null => {
        const c = advance();
        switch (c) {
            case "(":
                return { type: TokenType.LEFT_PAREN, lexeme: c, literal: null, line };
            case ")":
                return { type: TokenType.RIGHT_PAREN, lexeme: c, literal: null, line };
            case "{":
                return { type: TokenType.LEFT_BRACE, lexeme: c, literal: null, line };
            case "}":
                return { type: TokenType.RIGHT_BRACE, lexeme: c, literal: null, line };
            case ",":
                return { type: TokenType.COMMA, lexeme: c, literal: null, line };
            case ".":
                return { type: TokenType.DOT, lexeme: c, literal: null, line };
            case "-":
                return { type: TokenType.MINUS, lexeme: c, literal: null, line };
            case "+":
                return { type: TokenType.PLUS, lexeme: c, literal: null, line };
            case ";":
                return { type: TokenType.SEMICOLON, lexeme: c, literal: null, line };
            case "*":
                return { type: TokenType.STAR, lexeme: c, literal: null, line };
            case "!":
                return { type: TokenType.BANG, lexeme: c, literal: null, line };
            case "=":
                return { type: TokenType.EQUAL, lexeme: c, literal: null, line };
            case ">":
                return { type: TokenType.GREATER, lexeme: c, literal: null, line };
            case "<":
                return { type: TokenType.LESS, lexeme: c, literal: null, line };
            default:
                return null;
        }
    }

    while (!isAtEnd()) {
        const maybeToken = scanToken();
        if (maybeToken) {
            tokens.push(maybeToken);
        } else {
            return { state: "error", error: { line, message: "Unexpected character", where: source[current] } };
        }
    }

    tokens.push({ type: TokenType.EOF, lexeme: "", literal: null, line });

    return {
        state: "success",
        tokens
    }
}