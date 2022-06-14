import { Token } from "./types"

enum ExprType {
    BINARY,
    GROUPING,
    LITERAL,
    UNARY
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

type Expr = BinaryExpr | GroupingExpr | LiteralExpr | UnaryExpr

export {
    BinaryExpr,
    GroupingExpr,
    LiteralExpr,
    UnaryExpr,
    Expr,
    ExprType
}