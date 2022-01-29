import {
  base58,
  context,
  ContractPromise,
  ContractPromiseBatch,
  env,
  logging,
  PersistentSet,
  storage,
  u128
} from 'near-sdk-as';
import {AccountId, MIN_ACCOUNT_BALANCE, XCC_GAS} from "../../utils";
import {AccountCreatedArgs} from "./models";

// import donate contract bytecode as StaticArray
const CODE = includeBytes("../../../build/release/donate.wasm")

const INIT_STORAGE_KEY = "i"

@nearBindgen
export class Contract {

  accounts: PersistentSet<AccountId> = new PersistentSet<AccountId>("a")

  init(): void {
    // contract may only be initialized once
    assert(!this.is_initialized(), "Contract is already initialized")

    // storing factory metadata requires some storage staking (balance locked to offset cost of data storage)
    assert(
        u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
        "Minimum account balance must be attached to initialize this contract (3 NEAR)"
    )

    storage.set<bool>(INIT_STORAGE_KEY, true)

    logging.log("factory was created")
  }

  add_donate_account(): void {
    this.assert_contract_is_initialized()
    this.assert_called_by_donate_account()

    // storing meme metadata requires some storage staking (balance locked to offset cost of data storage)
    assert(
        u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
        "Minimum account balance must be attached to initialize an account (3 NEAR)"
    );

    const account = context.predecessor

    // We don't need the following, context.predecessor is always valid
    // assert(env.isValidAccountID(account), "Donation account must have valid NEAR account name")
    assert(!this.has_account(account), "Donation account already exists")

    logging.log("Attempting to create account [ " + account + " ]")

    let promise = ContractPromiseBatch.create(account)
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
    return storage.getPrimitive<bool>(INIT_STORAGE_KEY, false)
  }

  private assert_contract_is_initialized(): void {
    assert(this.is_initialized(), "Contract must be initialized first")
  }

  private is_donate_account(): bool {
    return context.predecessor.startsWith("donate.")
  }

  private assert_called_by_donate_account(): void {
    assert(this.is_donate_account(), "This function can only be called by donate contract")
  }

  private has_account(accountId: string): bool {
    return this.accounts.has(accountId)
  }
}
