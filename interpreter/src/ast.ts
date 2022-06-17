import { Token } from "./types"

enum ExprType {
    BINARY,
    GROUPING,
    LITERAL,
    UNARY,
    VARIABLE,
    ASSIGNMENT,
    LOGICAL,
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

interface LogicalExpr extends BaseExpr {
    left: Expr
    right: Expr
    operator: Token
    type: ExprType.LOGICAL
}

type Expr = BinaryExpr | GroupingExpr | LiteralExpr | UnaryExpr | VariableExpr | AssignmentExpr | LogicalExpr


enum StatementType {
    EXPRESSION = "EXPRESSION",
    PRINT = "PRINT",
    BLOCK = "BLOCK",
    IF = "IF",
    WHILE = "WHILE",
    FOR = "FOR",
}
interface ExprStatement {
    type: StatementType.EXPRESSION
    expression: Expr
}

interface PrintStatement {
    type: StatementType.PRINT
    expression: Expr
}

interface BlockStatement {
    type: StatementType.BLOCK
    declarations: Declaration[]
}

interface IfStatement {
    type: StatementType.IF
    condition: Expr,
    then: Statement,
    else?: Statement
}

interface WhileStatement {
    type: StatementType.WHILE
    condition: Expr,
    body: Statement
}

interface ForStatement {
    type: StatementType.FOR,
    initializer: Expr,
    condition: Expr,
    increment: Expr,
    body: Statement
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

type Statement = ExprStatement | PrintStatement | BlockStatement | IfStatement | WhileStatement | ForStatement
type Declaration = VariableDeclaration | StatementDeclaration

export {
    BinaryExpr,
    GroupingExpr,
    LiteralExpr,
    UnaryExpr,
    VariableExpr,
    AssignmentExpr,
    LogicalExpr,
    Expr,
    ExprType,
    Statement,
    ExprStatement,
    PrintStatement,
    BlockStatement,
    IfStatement,
    WhileStatement,
    ForStatement,
    StatementType,
    Declaration,
    DeclarationType,
}