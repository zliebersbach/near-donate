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

  accounts: PersistentSet<AccountId> = new PersistentSet<AccountId>("a")

  init(): void {
    // contract may only be initialized once
    assert(!this.is_initialized(), "Contract is already initialized.")

    // storing meme metadata requires some storage staking (balance locked to offset cost of data storage)
    assert(
        u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
        "Minimum account balance must be attached to initialize this contract (3 NEAR)"
    )

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

  get_accounts(): AccountId[] {
    return this.accounts.values()
  }

  private is_initialized(): bool {
    return true
  }

  private assert_contract_is_initialized(): void {
    assert(this.is_initialized(), "Contract must be initialized first.")
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
