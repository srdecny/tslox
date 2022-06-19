import { LoxObject, LoxObjectType } from "./objects";
import { LoxRuntimeError, Token } from "./types";

export default class Environment {
    scopes: { [key: string]: LoxObject | undefined }[] = [{
        "clock": {
            type: LoxObjectType.NATIVE_FUNCTION,
            arity: 0,
            value: undefined,
            call: (args: any[]) => {
                return {
                    type: LoxObjectType.NUMBER,
                    value: new Date().getTime()
                }
            }

      }
  }];

  nest() {
    this.scopes = [{}, ...this.scopes];
  }

  pop() {
    this.scopes = this.scopes.slice(1);
  }

  get(name: string): LoxObject {
    const scope = this.scopes.find((scope) => scope.hasOwnProperty(name));
    if (scope) {
      if (scope[name] === undefined)
        throw new LoxRuntimeError(`Using unintialized variable ${name}`);
      return scope[name];
    }
    throw new LoxRuntimeError(`Undefined variable ${name}`);
  }

  assign(name: Token, value: LoxObject | undefined): void {
    const scope = this.scopes.find((scope) =>
      scope.hasOwnProperty(name.lexeme)
    );
    if (scope) {
      scope[name.lexeme] = value;
    } else {
      this.scopes[0][name.lexeme] = value;
    }
  }

    define(name: Token, value: LoxObject | undefined): void {
        this.scopes[0][name.lexeme] = value;
    }
}
