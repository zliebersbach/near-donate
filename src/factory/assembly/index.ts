import {base58, context, Context, ContractPromiseBatch, env, PersistentSet} from 'near-sdk-as';
import {AccountId} from "../../utils";

// import donate contract bytecode as StaticArray
const CODE = includeBytes("../../../build/release/donate.wasm")

@nearBindgen
export class Contract {

  accounts: PersistentSet<AccountId> = new PersistentSet<AccountId>("a");

  private static sender_account_id(): string {
    return `donate.${Context.sender}`
  }

  create_account(): string {
    const accountId = Contract.sender_account_id()

    assert(env.isValidAccountID(accountId), "Donation account must have valid NEAR account name")
    assert(!this.has_account(accountId), "Donation account already exists")

    let promise = ContractPromiseBatch.create(accountId)
        .create_account()
        .deploy_contract(Uint8Array.wrap(changetype<ArrayBuffer>(CODE)))
        .add_full_access_key(base58.decode(context.senderPublicKey))

    /*promise.function_call(
        "init",
        new MemeInitArgs(title, data, category),
        context.attachedDeposit,
        XCC_GAS
    );*/

    return accountId;
  }

  private has_account(accountId: string): bool {
    return this.accounts.has(accountId)
  }
}
