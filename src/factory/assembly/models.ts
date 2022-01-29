import {AccountId} from "../../utils";


@nearBindgen
export class AccountCreatedArgs {
  constructor(
      public account: AccountId
  ) {
  }
}
