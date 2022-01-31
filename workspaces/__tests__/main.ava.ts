/**
 * Welcome to near-workspaces-ava!
 *
 * This is a working test which checks the functionality of [the status-message
 * contract][1]. For quick reference, here's the contract's implementation:
 *
 *     impl StatusMessage {
 *         pub fn set_status(&mut self, message: String) {
 *             let account_id = env::signer_account_id();
 *             self.records.insert(&account_id, &message);
 *         }

 *         pub fn get_status(&self, account_id: String) -> Option<String> {
 *             return self.records.get(&account_id);
 *         }
 *     }
 *
 * As you can see, this contract only has two methods, a setter and a getter.
 * The setter sets a status message for the account that signed the call to the
 * contract. The getter accepts an `account_id` param and returns the status for
 * that account.
 *
 * The tests below create a local blockchain with this contract deployed to
 * one account and two more accounts which store statuses in the contract.
 *
 *   [1]: https://github.com/near-examples/rust-status-message/tree/4e4767db257b748950bb3393352e2fff6c8e9b17
 */

/**
 * Start off by importing Workspace from near-workspaces-ava.
 */
import {BN, Gas, NEAR, parse, Workspace} from 'near-workspaces-ava';
import {
  INIT_ACCOUNT_BALANCE,
  MIN_ACCOUNT_BALANCE,
  MIN_DONATION_AMOUNT,
  MIN_DONATION_AMOUNT_FEES, MIN_DONATION_AMOUNT_RECEIVED,
  XCC_GAS
} from "../utils";

/**
 * Initialize a new workspace. In local sandbox mode, this will:
 *
 *   - Create a new local blockchain
 *   - Create the root account for that blockchain (see `root` below)
 *   - Execute any actions passed to the function
 *   - Shut down the newly created blockchain, but *save the data*
 */
const workspace = Workspace.init(async ({root}) => {
  // Create a subaccount of the root account, like `alice.sandbox`
  // (the actual account name is not guaranteed; you can get it with `alice.accountId`)
  const alice = await root.createAccount('alice', {initialBalance: INIT_ACCOUNT_BALANCE.toString()});
  const forestco = await root.createAccount('forestco', {initialBalance: INIT_ACCOUNT_BALANCE.toString()});

  // Create a subaccount of the root account, and also deploy a contract to it
  const factory = await root.createAndDeploy(
      // Subaccount name
      'factory',

      // Relative path (from package.json location) to the compiled contract file
      // which will be deployed to this account
      'build/release/factory.wasm',

      {
        initialBalance: '0',

        // Provide `method` and `args` to call in the same transaction as the deploy
        method: 'init',
        args: {owners: [root.accountId]},
        attachedDeposit: MIN_ACCOUNT_BALANCE
      },
  );

  // Return the accounts that you want available in subsequent tests
  // (`root` is always available)
  return {alice, forestco, factory};
});

/**
 * Now you can write some tests! In local sandbox mode, each `workspace.test` will:
 *
 *   - start a new local blockchain
 *   - copy the state from the blockchain created in `Workspace.init`
 *   - get access to the accounts created in `Workspace.init` using the same variable names
 *   - run concurrently with all other `workspace.test` calls, keeping data isolated
 *   - shut down at the end, forgetting all new data created
 *
 * It's also worth knowing that `workspace.test` is syntax sugar added by
 * near-workspaces-ava. With raw AVA + near-workspaces, here's how to write a test:
 *
 *     import avaTest from 'ava';
 *     import {Workspace} from 'near-workspaces';
 *     // Alternatively, you can import Workspace and ava both from near-workspaces-ava:
 *     // import {ava as avaTest, Workspace} from 'near-workspaces-ava';
 *
 *     const workspace = Workspace.init(...);
 *
 *     avaTest('root sets status', async test => {
 *       await workspace.fork(async ({contract, root}) => {
 *         ...
 *       });
 *     });
 *
 * Instead, with the syntax sugar, you can write this as you see it below –
 * saving an indentation level and avoiding one extra `await`.
 * (Extra credit: try rewriting this test using the "sugar-free" syntax.)
 */

workspace.test('factory is initialized', async (test, {root, factory}) => {
  const state = await factory.viewState()
  test.log(state)
  test.true(state.get('f').data.length > 0)

  // Assert balance is in correct range
  const balance = await factory.availableBalance()
  test.is(balance.toString().length, MIN_ACCOUNT_BALANCE.toString().length)

  // Assert owners have been correctly set
  const owners: string[] = await factory.view('get_owners', {})
  test.deepEqual(owners, [root.accountId])

  // Assert accounts are empty
  const accounts: string[] = await factory.view('get_accounts', {})
  test.is(accounts.length, 0)

  // Assert fees are set to zero
  const fees: string = await factory.view('get_fees', {})
  test.is(fees, '0')
})

workspace.test('factory adds account', async (test, {root, forestco, factory}) => {
  // Don't forget to `await` your calls!
  await forestco.call(
      factory,
      'add_account',
      {},
      {
        attachedDeposit: MIN_ACCOUNT_BALANCE,
        gas: XCC_GAS
      }
  );

  // Assert that account was actually created
  const donate = factory.getAccount('forestco')
  test.true(await donate.exists())
  test.log(await donate.accountView())

  // Assert that there is now one donation account in factory.
  // Note that Root called the contract with `root.call(contract, ...)`, but
  // you view the contract with `contract.view`, since the account doing the
  // viewing is irrelevant.
  const accounts: string[] = await factory.view('get_accounts', {})
  test.is(accounts.length, 1)
  test.is(accounts[0], donate.accountId)

  // Assert that we can call the deployed contract in the new donation account
  test.is(
      await donate.view('get_balance', {}),
      '0',
  )

  // Assert that the donation account has the correct factory account
  test.is(
      await donate.view('get_factory', {}),
      factory.accountId,
  )
});

workspace.test('alice can send donation and factory receives fees', async (test, {alice, forestco, factory}) => {
  // Don't forget to `await` your calls!
  await forestco.call(
      factory,
      'add_account',
      {},
      {
        attachedDeposit: MIN_ACCOUNT_BALANCE,
        gas: XCC_GAS
      }
  );

  // Assert that account was actually created
  const donate = factory.getAccount('forestco')
  test.true(await donate.exists())

  // Assert initial fee balance is zero
  const fees: string = await factory.view('get_fees', {})
  test.is(fees, '0')

  await alice.call(
      donate,
      'send_donation',
      {},
      {
        attachedDeposit: MIN_DONATION_AMOUNT,
        gas: XCC_GAS,
      }
  )

  // Assert donation contract has updated balance
  const balance: string = await donate.view('get_balance', {})
  test.is(balance, MIN_DONATION_AMOUNT_RECEIVED.toString())

  // Assert factory contract has updated fees
  const new_fees: string = await factory.view('get_fees', {})
  test.is(new_fees, MIN_DONATION_AMOUNT_FEES.toString())
})

// For more example tests, see:
// https://github.com/near/workspaces-js/tree/main/__tests__
