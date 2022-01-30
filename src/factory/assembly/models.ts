import {AccountId, Amount} from "../../utils";


@nearBindgen
export class AccountAddedArgs {
  constructor(
      public account: AccountId
  ) {
  }
}

@nearBindgen
export class FeesWithdrawnArgs {
  constructor(
      public owner: AccountId,
      public amount: Amount,
  ) {
  }
}
