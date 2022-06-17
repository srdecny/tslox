import { LoxObject } from "./objects";
import { LoxRuntimeError, Token } from "./types";

export default class Environment {
  scopes: { [key: string]: LoxObject | undefined }[] = [{}];

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
    this.scopes[0][name.lexeme] = value;
  }
}
