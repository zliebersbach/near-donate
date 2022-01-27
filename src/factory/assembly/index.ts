import {
  base58,
  context,
  Context,
  ContractPromise,
  ContractPromiseBatch,
  env,
  logging,
  PersistentSet,
  u128
} from 'near-sdk-as';
import {AccountId, Amount, MIN_ACCOUNT_BALANCE, XCC_GAS} from "../../utils";
import {AccountCreatedArgs, FeesWithdrawnArgs} from "./models";

// import donate contract bytecode as StaticArray
const CODE = includeBytes("../../../build/release/donate.wasm")

@nearBindgen
export class Contract {

  owners: PersistentSet<AccountId> = new PersistentSet<AccountId>("o")
  accounts: PersistentSet<AccountId> = new PersistentSet<AccountId>("a")
  balance: Amount = u128.Zero

  init(owners: AccountId[]): void {
    // contract may only be initialized once
    assert(!this.is_initialized(), "Contract is already initialized.")

    // storing meme metadata requires some storage staking (balance locked to offset cost of data storage)
    assert(
        u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
        "Minimum account balance must be attached to initialize this contract (3 NEAR)"
    )

    // Must have least 1 owner account
    assert(owners.length > 0, "Must specify at least 1 owner")

    // set the owners using incoming metadata
    for (let i = 0; i < owners.length; i++) {
      this.owners.add(owners[i])
    }

    logging.log("factory was created")
  }

  create_account(): void {
    this.assert_contract_is_initialized()

    // storing meme metadata requires some storage staking (balance locked to offset cost of data storage)
    assert(
        u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
        "Minimum account balance must be attached to initialize a meme (3 NEAR)"
    );

    const account = "donate." + Context.predecessor

    assert(env.isValidAccountID(account), "Donation account must have valid NEAR account name")
    assert(!this.has_account(account), "Donation account already exists")

    logging.log("attempting to create account")

    let promise = ContractPromiseBatch.create(account)
        .create_account()
        .deploy_contract(Uint8Array.wrap(changetype<ArrayBuffer>(CODE)))
        .add_full_access_key(base58.decode(context.senderPublicKey))

    promise.function_call(
        "init",
        "{}",
        context.attachedDeposit,
        XCC_GAS
    )

    promise.then(context.contractName).function_call(
        "on_account_created",
        new AccountCreatedArgs(account),
        u128.Zero,
        XCC_GAS
    )
  }

  on_account_created(account: AccountId): void {
    let results = ContractPromise.getResults();
    let accountCreated = results[0];

    // Verifying the remote contract call succeeded.
    // https://nomicon.io/RuntimeSpec/Components/BindingsSpec/PromisesAPI.html?highlight=promise#returns-3
    switch (accountCreated.status) {
      case 0:
        // promise result is not complete
        logging.log("Account creation for [ " + account + " ] is pending")
        break;
      case 1:
        // promise result is complete and successful
        logging.log("Account creation for [ " + account + " ] succeeded")
        this.accounts.add(account)
        break;
      case 2:
        // promise result is complete and failed
        logging.log("Account creation for [ " + account + " ] failed")
        break;

      default:
        logging.log("Unexpected value for promise result [" + accountCreated.status.toString() + "]");
        break;
    }
  }

  get_balance(): Amount {
    this.assert_contract_is_initialized()

    return this.balance
  }

  deposit_fees(): void {
    this.assert_contract_is_initialized()
    this.assert_called_by_donate_contract()

    this.balance = u128.add(Context.attachedDeposit, this.balance)

    logging.log("Received fee deposit of " + Context.attachedDeposit.toString() + " NEAR from [ " + Context.predecessor + " ]")
  }

  withdraw_fees(amount: Amount): void {
    this.assert_contract_is_initialized()
    this.assert_signed_by_owner()

    assert(
        u128.le(amount, this.balance),
        "Amount is more than balance."
    )

    const account = Context.predecessor

    const promise = ContractPromiseBatch.create(account)
        .transfer(amount)

    promise.then(Context.contractName).function_call(
        "on_fees_withdrawn",
        new FeesWithdrawnArgs(account, amount),
        u128.Zero,
        XCC_GAS
    )
  }

  on_fees_withdrawn(account: AccountId, amount: Amount): void {
    let results = ContractPromise.getResults();
    let feesWithdrawn = results[0];

    // Verifying the remote contract call succeeded.
    // https://nomicon.io/RuntimeSpec/Components/BindingsSpec/PromisesAPI.html?highlight=promise#returns-3
    switch (feesWithdrawn.status) {
      case 0:
        // promise result is not complete
        logging.log("Fee withdrawal for [ " + account + " ] is pending")
        break;
      case 1:
        // promise result is complete and successful
        logging.log(`Transferred ${amount.toString()} NEAR to [ ${account} ]`)
        this.balance = u128.sub(this.balance, amount)
        break;
      case 2:
        // promise result is complete and failed
        logging.log("Fee withdrawal for [ " + account + " ] failed")
        break;

      default:
        logging.log("Unexpected value for promise result [" + feesWithdrawn.status.toString() + "]");
        break;
    }
  }

  private is_initialized(): bool {
    return this.owners.size > 0
  }

  private assert_contract_is_initialized(): void {
    assert(this.is_initialized(), "Contract must be initialized first.")
  }

  private is_owner(): bool {
    return this.owners.has(context.predecessor)
  }

  private assert_signed_by_owner(): void {
    assert(this.is_owner(), "This method can only be called by contract owner")
  }

  private is_donate_contract(): bool {
    return Context.predecessor.startsWith("donate.")
  }

  private assert_called_by_donate_contract(): void {
    assert(this.is_donate_contract(), "This function can only be called by donate contract")
  }

  private has_account(accountId: string): bool {
    return this.accounts.has(accountId)
  }
}
