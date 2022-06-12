import { Token } from "./types"

enum ExprKind {
    BINARY,
    GROUPING,
    LITERAL,
    UNARY
}

interface Expr {
    kind: ExprKind
}
interface BinaryExpr extends Expr {
    left: Expr
    right: Expr
    operator: Token
    kind: ExprKind.BINARY
}

interface GroupingExpr extends Expr {
    expression: Expr
    kind: ExprKind.GROUPING
}

interface LiteralExpr extends Expr {
    value: any
    kind: ExprKind.LITERAL
}

interface UnaryExpr extends Expr {
    right: Expr
    operator: Token
    kind: ExprKind.UNARY
}

export {
    BinaryExpr,
    GroupingExpr,
    LiteralExpr,
    UnaryExpr,
}