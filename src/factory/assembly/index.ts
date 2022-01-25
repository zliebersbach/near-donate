import {Context} from 'near-sdk-as';


@nearBindgen
export class Contract {

  greetWorld(): string {
    return 'hello, world!';
  }

  greetMe(): string {
    return `hello, ${Context.sender}!`;
  }
}
