import {context, Context, ContractPromise, ContractPromiseBatch, logging, PersistentVector, u128} from 'near-sdk-as';
import {
  AccountId,
  Amount,
  MIN_ACCOUNT_BALANCE,
  MIN_DONATION_AMOUNT,
  PAGE_SIZE,
  PLATFORM_FEE_DIVISOR,
  XCC_GAS
} from "../../utils";
import {DonateArgs, Donation, DonationsWithdrawnArgs} from "./models";


@nearBindgen
export class Contract {

  factoryAccount: AccountId

  donations: PersistentVector<Donation> = new PersistentVector<Donation>("d")
  balance: Amount = u128.Zero

  init(factoryAccount: AccountId): void {
    // contract may only be initialized once
    assert(!this.is_initialized(), "Contract is already initialized.")

    // storing donate metadata requires some storage staking (balance locked to offset cost of data storage)
    assert(
        u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
        "Minimum account balance must be attached to initialize this contract (3 NEAR)"
    )

    this.factoryAccount = factoryAccount

    logging.log("donate account was created")
  }

  donate(): void {
    this.assert_contract_is_initialized()

    assert(
        u128.ge(context.attachedDeposit, MIN_DONATION_AMOUNT),
        "Minimum donation must be attached (1 NEAR)"
    )

    const feeAmount = u128.div(context.attachedDeposit, PLATFORM_FEE_DIVISOR)
    const donationAmount = u128.sub(context.attachedDeposit, feeAmount)

    const promise = ContractPromiseBatch.create(this.factoryAccount)
        .function_call(
            "deposit_fees",
            "{}",
            feeAmount,
            XCC_GAS
        )

    promise.then(Context.contractName).function_call(
        "on_donate",
        new DonateArgs(donationAmount),
        u128.Zero,
        XCC_GAS
    )
  }

  on_donate(amount: Amount): void {
    let results = ContractPromise.getResults();
    let donate = results[0];

    // Verifying the remote contract call succeeded.
    // https://nomicon.io/RuntimeSpec/Components/BindingsSpec/PromisesAPI.html?highlight=promise#returns-3
    switch (donate.status) {
      case 0:
        // promise result is not complete
        logging.log("Donation is pending")
        break;
      case 1:
        // promise result is complete and successful
        logging.log(`Received ${amount.toString()} NEAR`)
        this.balance = u128.add(this.balance, amount)
        this.donations.push(new Donation(context.predecessor, amount, context.blockTimestamp))
        break;
      case 2:
        // promise result is complete and failed
        logging.log("Donation failed")
        break;

      default:
        logging.log("Unexpected value for promise result [" + donate.status.toString() + "]");
        break;
    }
  }

  /**
   * Get list of donations received by this account.
   *
   * This function supports pagination.
   * @param page
   */
  get_donations(page: u32 = 0): Donation[] {
    this.assert_contract_is_initialized()

    const startIndex = page * PAGE_SIZE;
    const endIndex = Math.min(this.donations.length - 1, (page + 1) * PAGE_SIZE - 1)

    assert(startIndex < endIndex, "Page does not exist.")

    const results: Donation[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      results.push(this.donations[i])
    }

    return results
  }

  get_balance(): Amount {
    this.assert_contract_is_initialized()

    return this.balance
  }

  withdraw_donations(amount: Amount): void {
    this.assert_contract_is_initialized()
    this.assert_signed_by_parent()

    assert(
        u128.le(amount, this.balance),
        "Amount is more than balance."
    )

    const account = Context.predecessor

    const promise = ContractPromiseBatch.create(account)
        .transfer(amount)

    promise.then(Context.contractName).function_call(
        "on_donations_withdrawn",
        new DonationsWithdrawnArgs(amount),
        u128.Zero,
        XCC_GAS
    )
  }

  on_donations_withdrawn(amount: Amount): void {
    let results = ContractPromise.getResults();
    let donationsWithdrawn = results[0];

    // Verifying the remote contract call succeeded.
    // https://nomicon.io/RuntimeSpec/Components/BindingsSpec/PromisesAPI.html?highlight=promise#returns-3
    switch (donationsWithdrawn.status) {
      case 0:
        // promise result is not complete
        logging.log("Donation withdrawal is pending")
        break;
      case 1:
        // promise result is complete and successful
        logging.log(`Transferred ${amount.toString()} NEAR`)
        this.balance = u128.sub(this.balance, amount)
        break;
      case 2:
        // promise result is complete and failed
        logging.log("Donation withdrawal failed")
        break;

      default:
        logging.log("Unexpected value for promise result [" + donationsWithdrawn.status.toString() + "]");
        break;
    }
  }

  private is_initialized(): bool {
    return this.factoryAccount != null
  }

  private assert_contract_is_initialized(): void {
    assert(this.is_initialized(), "Contract must be initialized first.")
  }

  private is_parent(): bool {
    return Context.contractName.endsWith(Context.predecessor)
  }

  private assert_signed_by_parent(): void {
    assert(this.is_parent(), "Must be called by parent. e.g. myorg.near if your donation account is donate.myorg.near")
  }
}
