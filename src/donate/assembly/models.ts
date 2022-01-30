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
export class DonateInitArgs {
  constructor(
      public owner: AccountId
  ) {
  }
}

@nearBindgen
export class DonationSentArgs {
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
