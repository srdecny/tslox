import { Token, TokenType, ParseError } from "./types";
import {
  Expr,
  ExprType,
  Statement,
  StatementType,
  Declaration,
  DeclarationType,
} from "./ast";

export const parse = (tokens: Token[]): Declaration[] | undefined => {
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

  const program = (): Declaration[] => {
    const declarations: Declaration[] = [];
    while (peek().type !== TokenType.EOF) {
      declarations.push(declaration());
    }
    consume("Expected EOF while parsing", TokenType.EOF);
    return declarations;
  };

  const declaration = (): Declaration => {
    let declaration: Declaration;
    if (match(TokenType.VAR)) {
      consume("Expected variable name", TokenType.IDENTIFIER);
      declaration = {
        type: DeclarationType.VAR,
        name: previous(),
        intializer: match(TokenType.EQUAL) ? expression() : undefined,
      };
    } else {
      declaration = {
        type: DeclarationType.STATEMENT,
        statement: statement(),
      };
    }
    return declaration;
  };

  const statement = (): Statement => {
    let statement: Statement;
    if (match(TokenType.PRINT)) {
      statement = {
        type: StatementType.PRINT,
        expression: expression(),
      };
      return statement;
    } else if (match(TokenType.LEFT_BRACE)) {
      return {
        type: StatementType.BLOCK,
        declarations: block(),
      };
    } else {
      statement = {
        type: StatementType.EXPRESSION,
        expression: expression(),
      };
      return statement;
    }
  };

  const block = (): Declaration[] => {
    const declarations: Declaration[] = [];
    while (!check(TokenType.RIGHT_BRACE) && !isAtEnd()) {
      declarations.push(declaration());
    }
    consume("Expected '}' after block", TokenType.RIGHT_BRACE);
    return declarations;
  };

  const expression = (): Expr => {
    let expr = assignment();
    while (match(TokenType.COMMA)) {
      // Comma operator
      expr = {
        type: ExprType.BINARY,
        operator: previous(),
        left: expr,
        right: assignment(),
      };
    }
    consume("Expected ';' after declaration", TokenType.SEMICOLON);
    return expr;
  };

  const assignment = (): Expr => {
    const expr = equality();
    if (match(TokenType.EQUAL)) {
      const equals = previous();
      const value = assignment();
      if (expr.type === ExprType.VARIABLE) {
        return {
          type: ExprType.ASSIGNMENT,
          name: expr.name,
          value: value,
        };
      }
      throw new ParseError(equals, "Invalid assignment target");
    }
    return expr;
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
    if (match(TokenType.IDENTIFIER)) {
      return { type: ExprType.VARIABLE, name: previous() };
    }
  };

  return program();
};
