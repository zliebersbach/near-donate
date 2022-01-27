import {AccountId, Amount, Timestamp} from "../../utils";

@nearBindgen
export class Donation {
  constructor(
      public donor: AccountId,
      public amount: Amount,
      public timestamp: Timestamp
  ) {
  }
}

@nearBindgen
export class AccountInitArgs {
  constructor(
      public factoryAccount: AccountId
  ) {
  }
}


@nearBindgen
export class DonateArgs {
  constructor(
      public amount: Amount
  ) {
  }
}

@nearBindgen
export class DonationsWithdrawnArgs {
  constructor(
      public amount: Amount
  ) {
  }
}
