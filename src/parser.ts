import { Token, TokenType, ParseError } from "./types";
import { Expr, ExprType } from "./ast";

export const parse = (tokens: Token[]): Expr | undefined => {
  let current = 0;

  const isAtEnd = () => current >= tokens.length;
  const check = (type: TokenType) =>
    isAtEnd() ? false : tokens[current].type === type;
  const previous = () => tokens[current - 1];
  const peek = () => tokens[current];
  const advance = () => tokens[isAtEnd() ? current : current++];
  const match = (...types: TokenType[]) =>
    types.find((type) => check(type)) !== undefined ? (advance(), true) : false;
  const consume = (message: string, ...types: TokenType[]) => {
    if (match(...types)) return true;
    throw new ParseError(peek(), message);
  };

  const expression = (): Expr => {
    return equality();
  };
  const equality = (): Expr => {
    let expr = comparison();
    while (match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = previous();
      const right = comparison();
      expr = { type: ExprType.BINARY, operator, left: expr, right };
    }
    return expr;
  };
  const comparison = (): Expr => {
    let expr = term();
    while (
      match(
        TokenType.LESS,
        TokenType.LESS_EQUAL,
        TokenType.GREATER,
        TokenType.GREATER_EQUAL
      )
    ) {
      const operator = previous();
      const right = term();
      expr = { type: ExprType.BINARY, operator, left: expr, right };
    }
    return expr;
  };
  const term = (): Expr => {
    let expr = factor();
    while (match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = previous();
      const right = factor();
      expr = { type: ExprType.BINARY, operator, left: expr, right };
    }
    return expr;
  };
  const factor = (): Expr => {
    let expr = unary();
    while (match(TokenType.STAR, TokenType.SLASH)) {
      const operator = previous();
      const right = unary();
      expr = { type: ExprType.BINARY, operator, left: expr, right };
    }
    return expr;
  };
  const unary = (): Expr => {
    if (match(TokenType.MINUS, TokenType.BANG)) {
      const operator = previous();
      const right = unary();
      return { type: ExprType.UNARY, operator, right };
    }
    return primary();
  };
  const primary = (): Expr => {
    if (match(TokenType.FALSE)) return { type: ExprType.LITERAL, value: false };
    if (match(TokenType.TRUE)) return { type: ExprType.LITERAL, value: true };
    if (match(TokenType.NIL)) return { type: ExprType.LITERAL, value: null };
    if (match(TokenType.NUMBER, TokenType.STRING)) {
      return { type: ExprType.LITERAL, value: previous().literal };
    }
    if (match(TokenType.LEFT_PAREN)) {
      const expr = expression();
      consume("Expected a right parenthesis.", TokenType.RIGHT_PAREN);
      return { type: ExprType.GROUPING, expression: expr };
    }
  };

  try {
    return expression();
  } catch (e) {
    if (e instanceof ParseError) {
      console.error(e.message);
      return undefined;
    }
    throw e;
  }
};
