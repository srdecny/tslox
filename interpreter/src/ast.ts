import { Token } from "./types"

enum ExprType {
    BINARY,
    GROUPING,
    LITERAL,
    UNARY,
    VARIABLE,
    ASSIGNMENT
}

interface BaseExpr {
    type: ExprType
}
interface BinaryExpr extends BaseExpr {
    left: Expr
    right: Expr
    operator: Token
    type: ExprType.BINARY
}

interface GroupingExpr extends BaseExpr {
    expression: Expr
    type: ExprType.GROUPING
}

interface LiteralExpr extends BaseExpr {
    value: any
    type: ExprType.LITERAL
}

interface UnaryExpr extends BaseExpr {
    right: Expr
    operator: Token
    type: ExprType.UNARY
}

interface VariableExpr extends BaseExpr {
    name: Token
    type: ExprType.VARIABLE
}

interface AssignmentExpr extends BaseExpr {
    name: Token
    value: Expr
    type: ExprType.ASSIGNMENT
}

type Expr = BinaryExpr | GroupingExpr | LiteralExpr | UnaryExpr | VariableExpr | AssignmentExpr


enum StatementType {
    EXPRESSION = "EXPRESSION",
    PRINT = "PRINT",
}
interface ExprStatement {
    type: StatementType.EXPRESSION
    expression: Expr
}

interface PrintStatement {
    type: StatementType.PRINT
    expression: Expr
}

enum DeclarationType {
    VAR = "VAR",
    STATEMENT = "STATEMENT",
}

interface VariableDeclaration {
    type: DeclarationType.VAR
    name: Token,
    intializer?: Expr
}

interface StatementDeclaration {
    type: DeclarationType.STATEMENT
    statement: Statement
}

type Statement = ExprStatement | PrintStatement
type Declaration = VariableDeclaration | StatementDeclaration

export {
    BinaryExpr,
    GroupingExpr,
    LiteralExpr,
    UnaryExpr,
    VariableExpr,
    AssignmentExpr,
    Expr,
    ExprType,
    Statement,
    ExprStatement,
    PrintStatement,
    StatementType,
    Declaration,
    DeclarationType,
}