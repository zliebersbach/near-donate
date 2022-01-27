import {AccountId, Amount} from "../../utils";


@nearBindgen
export class AccountCreatedArgs {
  constructor(
      public account: AccountId
  ) {
  }
}

@nearBindgen
export class FeesWithdrawnArgs {
  constructor(
      public account: AccountId,
      public amount: Amount
  ) {
  }
}
