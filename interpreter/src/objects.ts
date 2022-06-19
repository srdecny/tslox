import { FunctionStatement, Statement } from "./ast";
import Environment from "./environment";
import { Token } from "./types";

export enum LoxObjectType {
  ANY,
  NIL,
  BOOLEAN,
  NUMBER,
  STRING,
  FUNCTION,
  NATIVE_FUNCTION
}

export interface LoxObjectBase {
  type: LoxObjectType;
}

export interface LoxNil extends LoxObjectBase {
  type: LoxObjectType.NIL;
  value: undefined;
}

export interface LoxBoolean extends LoxObjectBase {
  type: LoxObjectType.BOOLEAN;
  value: boolean;
}

export interface LoxNumber extends LoxObjectBase {
  type: LoxObjectType.NUMBER;
  value: number;
}

export interface LoxString extends LoxObjectBase {
  type: LoxObjectType.STRING;
  value: string;
}

export interface LoxAny extends LoxObjectBase {
  type: LoxObjectType.ANY;
  value: any;
}

export interface LoxNativeFunction extends LoxObjectBase {
  type: LoxObjectType.NATIVE_FUNCTION
  value: undefined
  arity: number
  call: (args: object[]) => LoxObject
}

export interface LoxFunction extends LoxObjectBase {
  type: LoxObjectType.FUNCTION
  statement: FunctionStatement
  closure: Environment
  value: undefined
}

export type LoxObject = LoxNil | LoxBoolean | LoxNumber | LoxString | LoxAny | LoxNativeFunction | LoxFunction;
