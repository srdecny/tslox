export enum LoxObjectType {
  ANY,
  NIL,
  BOOLEAN,
  NUMBER,
  STRING,
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

export type LoxObject = LoxNil | LoxBoolean | LoxNumber | LoxString | LoxAny;
