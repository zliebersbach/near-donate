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
import {AccountId, Amount, MIN_ACCOUNT_BALANCE, XCC_GAS} from "../../utils";
import {AccountAddedArgs, FeesWithdrawnArgs} from "./models";
import {DonateInitArgs} from "../../donate/assembly/models";

// import donate contract bytecode as StaticArray
const CODE = includeBytes("../../../build/release/donate.wasm")

const FEES_STORAGE_KEY = 'f'

@nearBindgen
export class Contract {

  owners: PersistentSet<AccountId> = new PersistentSet<AccountId>("o")
  accounts: PersistentSet<AccountId> = new PersistentSet<AccountId>("a")

  init(owners: AccountId[]): void {
    // contract may only be initialized once
    assert(!this.is_initialized(), "Contract is already initialized")

    // storing factory metadata requires some storage staking (balance locked to offset cost of data storage)
    assert(
        u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
        "Minimum account balance must be attached to initialize this contract (3 NEAR)"
    )

    storage.set(FEES_STORAGE_KEY, u128.Zero)

    // Must have least 1 owner account
    assert(owners.length > 0, "Must specify at least 1 owner");

    for (let i = 0; i < owners.length; i++) {
      this.owners.add(owners[i])
    }

    logging.log("factory was created")
  }

  add_account(): void {
    this.assert_contract_is_initialized()

    // storing meme metadata requires some storage staking (balance locked to offset cost of data storage)
    assert(
        u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
        "Minimum account balance must be attached to initialize an account (3 NEAR)"
    );

    const owner = context.predecessor
    const account = owner.split('.')[0] + '.' + context.contractName

    assert(env.isValidAccountID(account), "Donation account must have valid NEAR account name")
    assert(!this.has_account(account), "Donation account already exists")

    logging.log("Attempting to add account [ " + account + " ]")

    let promise = ContractPromiseBatch.create(account)
        .create_account()
        .deploy_contract(Uint8Array.wrap(changetype<ArrayBuffer>(CODE)))
        .add_full_access_key(base58.decode(context.senderPublicKey))

    promise.function_call(
        "init",
        new DonateInitArgs(owner),
        context.attachedDeposit,
        XCC_GAS
    )

    promise.then(context.contractName).function_call(
        "on_account_added",
        new AccountAddedArgs(account),
        u128.Zero,
        XCC_GAS
    )
  }

  on_account_added(account: AccountId): void {
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

  deposit_fees(): void {
    this.assert_contract_is_initialized()
    this.assert_called_by_subaccount()

    const fees = storage.getSome<u128>(FEES_STORAGE_KEY)
    storage.set(FEES_STORAGE_KEY, u128.add(fees, context.attachedDeposit))
  }

  withdraw_fees(amount: Amount): void {
    this.assert_contract_is_initialized()
    this.assert_called_by_owner()

    const owner = context.predecessor
    const fees = storage.getSome<u128>(FEES_STORAGE_KEY)

    assert(
        u128.le(amount, fees),
        'Attempting to withdraw too much.'
    )

    storage.set(FEES_STORAGE_KEY, u128.sub(fees, amount))

    const promise = ContractPromiseBatch.create(owner)
        .transfer(amount)

    promise.then(context.contractName).function_call(
        "on_fees_withdrawn",
        new FeesWithdrawnArgs(owner, amount),
        u128.Zero,
        XCC_GAS
    )
  }

  on_fees_withdrawn(owner: AccountId, amount: Amount): void {
    let results = ContractPromise.getResults();
    let feesWithdrawn = results[0];

    // Verifying the remote contract call succeeded.
    // https://nomicon.io/RuntimeSpec/Components/BindingsSpec/PromisesAPI.html?highlight=promise#returns-3
    switch (feesWithdrawn.status) {
      case 0:
        // promise result is not complete
        logging.log("Fee withdrawal to [ " + owner + " ] is pending")
        break;
      case 1:
        // promise result is complete and successful
        logging.log("Fee withdrawal to [ " + owner + " ] succeeded")
        break;
      case 2:
        // promise result is complete and failed
        logging.log("Fee withdrawal to [ " + owner + " ] failed")
        storage.set(FEES_STORAGE_KEY, u128.add(storage.getSome<u128>(FEES_STORAGE_KEY), amount))
        break;

      default:
        logging.log("Unexpected value for promise result [" + feesWithdrawn.status.toString() + "]");
        break;
    }
  }

  get_owners(): AccountId[] {
    this.assert_contract_is_initialized()

    return this.owners.values()
  }

  get_accounts(): AccountId[] {
    this.assert_contract_is_initialized()

    return this.accounts.values()
  }

  get_fees(): Amount {
    this.assert_contract_is_initialized()

    return storage.getSome<u128>(FEES_STORAGE_KEY)
  }

  private has_account(accountId: string): bool {
    return this.accounts.has(accountId)
  }

  private is_initialized(): bool {
    return this.owners.size > 0 && storage.hasKey(FEES_STORAGE_KEY)
  }

  private assert_contract_is_initialized(): void {
    assert(this.is_initialized(), "Contract must be initialized first")
  }

  private is_owner(): bool {
    return this.owners.has(context.predecessor)
  }

  private assert_called_by_owner(): void {
    assert(this.is_owner(), "This function can only be called by owner")
  }

  private is_subaccount(): bool {
    return context.predecessor.endsWith(context.contractName)
  }

  private assert_called_by_subaccount(): void {
    assert(this.is_subaccount(), "This function can only be called by donate contract")
  }
}
