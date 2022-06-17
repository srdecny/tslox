import { LoxObject } from "./objects";
import { LoxRuntimeError, Token } from "./types";

export default class Environment {
    values: { [key: string]: LoxObject } = {};

    get(name: string): LoxObject {
        if (this.values[name]) {
            return this.values[name];
        } else {
            throw new LoxRuntimeError(`Undefined variable ${name}`);
        }
    }

    set(name: string, value: LoxObject): void {
        this.values[name] = value;
    }

    define(name: string, value: LoxObject): void {
        this.values[name] = value;
    }

    assign(name: Token, value: LoxObject): void {
        if (this.values[name.lexeme]) {
            this.values[name.lexeme] = value;
            return
        } 
        throw new LoxRuntimeError(`Undefined variable ${name.lexeme}`);
    }



}