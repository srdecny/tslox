import { LoxNumber, LoxObject, LoxObjectType } from "./objects";
import {
  BinaryExpr,
  Declaration,
  DeclarationType,
  Expr,
  ExprType,
  GroupingExpr,
  LiteralExpr,
  StatementType,
  UnaryExpr,
  VariableExpr,
  AssignmentExpr,
  LogicalExpr
} from "./ast";
import { LoxRuntimeError, Token, TokenType } from "./types";
import { Statement } from "./ast";
import Environment from "./environment";

let env = new Environment();

export const execute = (declarations: Declaration[]) => {
  declarations.forEach((declaration) => {
    if (declaration.type === DeclarationType.VAR) {
      env.assign(
        declaration.name,
        declaration.intializer ? interpret(declaration.intializer) : undefined
      );
    }
    if (declaration.type === DeclarationType.STATEMENT) {
      evaluate(declaration.statement);
    }
  });
}

const evaluate = (statement: Statement) => {
  switch (statement.type) {
    case StatementType.EXPRESSION:
      interpret(statement.expression);
      break;
    case StatementType.PRINT:
      console.log(interpret(statement.expression).value);
      break;
    case StatementType.BLOCK:
      executeBlock(statement.declarations, env);
      break;
    case StatementType.IF:
      if (isTruthy(interpret(statement.condition))) {
        evaluate(statement.then);
      } else if (statement.else) {
        evaluate(statement.else);
      }
      break;
  }
};

const executeBlock = (declarations: Declaration[], env: Environment) => {
  try {
    env.nest()
      execute(declarations);
  } finally {
    env.pop();
  }
};

const interpret = (expression: Expr): LoxObject => {
  switch (expression.type) {
    case ExprType.BINARY:
      return interpretBinary(expression);
    case ExprType.GROUPING:
      return interpretGrouping(expression);
    case ExprType.LITERAL:
      return interpretLiteral(expression);
    case ExprType.UNARY:
      return interpretUnary(expression);
    case ExprType.VARIABLE:
      return interpretVariable(expression);
    case ExprType.ASSIGNMENT:
      return interpretAssignment(expression);
    case ExprType.LOGICAL:
      return interpretLogical(expression);
  }
};

const interpretAssignment = (expression: AssignmentExpr): LoxObject => {
  const value = interpret(expression.value);
  env.assign(expression.name, value);
  return value;
};

const interpretVariable = (expression: VariableExpr): LoxObject => {
  return env.get(expression.name.lexeme);
};

const interpretLogical = (expression: LogicalExpr): LoxObject => {
  const left = interpret(expression.left);
  if (expression.operator.type === TokenType.OR) {
    if (isTruthy(left)) return left;
    return interpret(expression.right);
  }
  if (expression.operator.type === TokenType.AND) {
    if (!isTruthy(left)) return left;
    return interpret(expression.right);
  }
}

const interpretUnary = (expression: UnaryExpr): LoxObject => {
  const right = interpret(expression.right);
  switch (expression.operator.type) {
    case TokenType.MINUS:
      return { type: LoxObjectType.NUMBER, value: -right.value };
    case TokenType.BANG:
      return { type: LoxObjectType.BOOLEAN, value: !isTruthy(right) };
  }
  throw Error("Unsupported unary operator");
};

const interpretLiteral = (expression: LiteralExpr): LoxObject => {
  // The typeof call could be avoided by passing another field in the LiteralExpr
  // ...it probably doesn't matter though
  switch (typeof expression.value) {
    case "string":
      return { type: LoxObjectType.STRING, value: expression.value };
    case "number":
      return { type: LoxObjectType.NUMBER, value: expression.value };
    case "boolean":
      return { type: LoxObjectType.BOOLEAN, value: expression.value };
    case "undefined":
      return { type: LoxObjectType.NIL, value: expression.value };
  }
};

const interpretGrouping = (expression: GroupingExpr): LoxObject => {
  return interpret(expression.expression);
};

const interpretBinary = (expression: BinaryExpr): LoxObject => {
  const left = interpret(expression.left);
  const right = interpret(expression.right);
  switch (expression.operator.type) {
    case TokenType.MINUS:
      checkForNumber(expression.operator, left, right);
      return { type: LoxObjectType.NUMBER, value: left.value - right.value };
    case TokenType.SLASH:
      checkForNumber(expression.operator, left, right);
      if (right.value === 0) {
        throw new LoxRuntimeError("Division by zero.");
      }
      return { type: LoxObjectType.NUMBER, value: left.value / right.value };
    case TokenType.STAR:
      checkForNumber(expression.operator, left, right);
      return { type: LoxObjectType.NUMBER, value: left.value * right.value };
    case TokenType.PLUS:
      if (
        left.type === LoxObjectType.STRING &&
        right.type === LoxObjectType.STRING
      ) {
        return { type: LoxObjectType.STRING, value: left.value + right.value };
      } else if (
        left.type === LoxObjectType.NUMBER &&
        right.type === LoxObjectType.NUMBER
      ) {
        return { type: LoxObjectType.NUMBER, value: left.value + right.value };
      }
      throw new LoxRuntimeError(
        `Operator ${expression.operator.lexeme} cannot be applied to ${left.type} and ${right.type}`
      );

    case TokenType.GREATER:
      checkForNumber(expression.operator, left, right);
      return { type: LoxObjectType.BOOLEAN, value: left.value > right.value };
    case TokenType.GREATER_EQUAL:
      checkForNumber(expression.operator, left, right);
      return { type: LoxObjectType.BOOLEAN, value: left.value >= right.value };
    case TokenType.LESS:
      checkForNumber(expression.operator, left, right);
      return { type: LoxObjectType.BOOLEAN, value: left.value < right.value };
    case TokenType.LESS_EQUAL:
      checkForNumber(expression.operator, left, right);
      return { type: LoxObjectType.BOOLEAN, value: left.value <= right.value };
    case TokenType.BANG_EQUAL:
      return { type: LoxObjectType.BOOLEAN, value: !isEqual(left, right) };
    case TokenType.EQUAL_EQUAL:
      return { type: LoxObjectType.BOOLEAN, value: isEqual(left, right) };
    case TokenType.COMMA:
      return right;
  }
};

const isTruthy = (obj: LoxObject): boolean => {
  if (obj.type === LoxObjectType.BOOLEAN) {
    return obj.value;
  }
  if (obj.type === LoxObjectType.NIL) {
    return false;
  }
  return true;
};

const isEqual = (left: LoxObject, right: LoxObject): boolean => {
  if (left.type === LoxObjectType.NIL && right.type === LoxObjectType.NIL)
    return true;
  if (left.type === LoxObjectType.NIL) return false;
  return left.value === right.value;
};

const checkForType = (type: LoxObjectType) => {
  return (operator: Token, ...params: LoxObject[]) => {
    if (params.some((param) => param.type !== type)) {
      throw new LoxRuntimeError(
        `Operator ${operator.lexeme} cannot be applied to ${params
          .map((param) => param.type)
          .join(" and ")}`
      );
    }
  };
};

const checkForNumber = checkForType(LoxObjectType.NUMBER);
const checkForString = checkForType(LoxObjectType.STRING);
