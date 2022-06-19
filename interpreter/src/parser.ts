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
      consume("Expected ';' after declaration", TokenType.SEMICOLON);
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
      consume("Expected ';' after statement", TokenType.SEMICOLON);
      return statement;
    } else if (match(TokenType.FUN)) {
      return functionStatement();
    } else if (match(TokenType.LEFT_BRACE)) {
      return {
        type: StatementType.BLOCK,
        declarations: block(),
      };
    } else if (match(TokenType.IF)) {
      return ifStatement();
    } else if (match(TokenType.WHILE)) {
      return whileStatement();
    } else if (match(TokenType.FOR)) {
      return forStatement();
    } else {
      statement = {
        type: StatementType.EXPRESSION,
        expression: expression(),
      };
      consume("Expected ';' after statement", TokenType.SEMICOLON);
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

  const functionStatement = (): Statement => {
    consume("Expected function name", TokenType.IDENTIFIER);
    const name = previous();
    consume("Expected '(' after function name", TokenType.LEFT_PAREN);
    const parameters = parameterList();
    consume("Expected ')' after parameters", TokenType.RIGHT_PAREN);
    consume("Expected '{' after function", TokenType.LEFT_BRACE);
    const body = block();
    return {
      type: StatementType.FUNCTION,
      name,
      parameters,
      arity: parameters.length,
      body,
    };
  }

  const parameterList = (): Token[] => {
    const parameters: Token[] = [];
    if (!check(TokenType.RIGHT_PAREN)) {
      do {
        consume("Expected parameter name", TokenType.IDENTIFIER);
        parameters.push(previous());
      } while (match(TokenType.COMMA));
    }
    return parameters;
  }

  const whileStatement = (): Statement => {
    consume("Expected '(' after 'while'", TokenType.LEFT_PAREN);
    const condition = expression();
    consume("Expected ')' after condition", TokenType.RIGHT_PAREN);
    const body = statement();
    return {
      type: StatementType.WHILE,
      condition,
      body,
    };
  };

  const forStatement = (): Statement => {
    consume("Expected '(' after 'for'", TokenType.LEFT_PAREN);
    let initializer: Declaration;
    if (match(TokenType.SEMICOLON)) {
      initializer = undefined;
    } else if (check(TokenType.VAR)) {
      initializer = declaration();
      if (initializer.type !== DeclarationType.VAR) {
        throw new ParseError(peek(), "Expected variable declaration");
      }
    } else {
      const initializerStmt = statement();
      if (initializerStmt.type !== StatementType.EXPRESSION) {
        throw new ParseError(peek(), "Expected expression");
      }
      initializer = {
        type: DeclarationType.STATEMENT,
        statement: initializerStmt,
      };
    }

    let condition: Expr;
    if (check(TokenType.SEMICOLON)) {
      condition = undefined;
    } else {
      condition = assignment();
    }
    consume("Expected ';' after condition", TokenType.SEMICOLON);

    let increment = undefined;
    if (!check(TokenType.RIGHT_PAREN)) {
      increment = expression();
    }
    consume("Expected ')' after increment", TokenType.RIGHT_PAREN);

    const stmnt2dec = (statement: Statement): Declaration => {
      return {
        type: DeclarationType.STATEMENT,
        statement,
      };
    };
    const expr2stmnt = (expression: Expr): Statement => {
      return {
        type: StatementType.EXPRESSION,
        expression,
      };
    };

    let body = statement();
    const bodyLoop = increment
      ? [stmnt2dec(body), stmnt2dec(expr2stmnt(increment))]
      : [stmnt2dec(body)];
    body = {
      type: StatementType.BLOCK,
      declarations: bodyLoop,
    };

    if (!condition) {
      condition = {
        type: ExprType.LITERAL,
        value: true,
      } as Expr;
    }

    body = {
      type: StatementType.WHILE,
      condition,
      body,
    }
    if (initializer) {
      body = {
        type: StatementType.BLOCK,
        declarations: [initializer, stmnt2dec(body)],
      }
    }

    return body;
  };

  const ifStatement = (): Statement => {
    consume("Expected '(' after 'if'", TokenType.LEFT_PAREN);
    const condition = expression();
    consume("Expected ')' after condition", TokenType.RIGHT_PAREN);
    const then = statement();
    let elseStatement = undefined;
    if (match(TokenType.ELSE)) elseStatement = statement();
    return {
      type: StatementType.IF,
      condition,
      then,
      else: elseStatement,
    };
  };

  const expression = (): Expr => {
    let expr = assignment();
    return expr;
  };

  const assignment = (): Expr => {
    const expr = or();
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

  const or = (): Expr => {
    let expr = and();
    while (match(TokenType.OR)) {
      const operator = previous();
      const right = and();
      expr = {
        type: ExprType.LOGICAL,
        operator,
        left: expr,
        right,
      };
    }
    return expr;
  };

  const and = (): Expr => {
    let expr = equality();
    while (match(TokenType.AND)) {
      const operator = previous();
      const right = equality();
      expr = {
        type: ExprType.LOGICAL,
        operator,
        left: expr,
        right,
      };
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
    return call();
  };

  const call = (): Expr => {
    let expr = primary();
    while (true) {
      if (match(TokenType.LEFT_PAREN)) {
        const paren = previous();
        const arg = args();
        expr = {
          type: ExprType.CALL,
          callee: expr,
          arguments: arg,
          paren
        };
      } else {
        break;
      }
    }
    return expr
  }

  const args = (): Expr[] => {
    let args = [];
    if (!check(TokenType.RIGHT_PAREN)) {
      do {
        args.push(expression());
      } while (match(TokenType.COMMA));
      consume("Expected ')' after arguments", TokenType.RIGHT_PAREN);
    }
    return args
  }
  const primary = (): Expr => {
    if (match(TokenType.FALSE)) return { type: ExprType.LITERAL, value: false };
    if (match(TokenType.TRUE)) return { type: ExprType.LITERAL, value: true };
    if (match(TokenType.NIL))
      return { type: ExprType.LITERAL, value: undefined };
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
