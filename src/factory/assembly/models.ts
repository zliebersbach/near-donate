import {AccountId} from "../../utils";


@nearBindgen
export class AccountAddedArgs {
  constructor(
      public account: AccountId
  ) {
  }
}
