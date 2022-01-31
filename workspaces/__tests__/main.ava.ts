/**
 * Start off by importing Workspace from near-workspaces-ava.
 */
import {Workspace} from 'near-workspaces-ava';
import {
  INIT_ACCOUNT_BALANCE,
  LARGE_DONATION_AMOUNT,
  LARGE_DONATION_AMOUNT_FEES,
  LARGE_DONATION_AMOUNT_RECEIVED,
  MIN_ACCOUNT_BALANCE,
  MIN_DONATION_AMOUNT,
  MIN_DONATION_AMOUNT_FEES,
  MIN_DONATION_AMOUNT_RECEIVED,
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
  // Create subaccounts of the root account, like `alice.sandbox`
  // (the actual account name is not guaranteed; you can get it with `alice.accountId`)

  // This account belongs to the contract owner
  const zoe = await root.createAccount('zoe', {initialBalance: INIT_ACCOUNT_BALANCE.toString()});
  // This account belongs to a beautiful, charitable person
  const alice = await root.createAccount('alice', {initialBalance: INIT_ACCOUNT_BALANCE.toString()});
  // This account belongs to a charity
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
        args: {owners: [zoe.accountId]},
        attachedDeposit: MIN_ACCOUNT_BALANCE
      },
  );

  // Return the accounts that you want available in subsequent tests
  // (`root` is always available)
  return {zoe, alice, forestco, factory};
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

workspace.test('factory is initialized', async (test, {zoe, factory}) => {
  const state = await factory.viewState()
  test.log(state)
  test.true(state.get('f').data.length > 0)

  // Assert balance is in correct range
  const balance = await factory.availableBalance()
  test.is(balance.toString().length, MIN_ACCOUNT_BALANCE.toString().length)

  // Assert owners have been correctly set
  const owners: string[] = await factory.view('get_owners', {})
  test.deepEqual(owners, [zoe.accountId])

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
  const donate = factory.getAccount(forestco.accountId.split('.')[0])
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
  const donate = factory.getAccount(forestco.accountId.split('.')[0])
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

workspace.test('forestco can withdraw donations', async (test, {alice, forestco, factory}) => {
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
  const donate = factory.getAccount(forestco.accountId.split('.')[0])
  test.true(await donate.exists())

  await alice.call(
      donate,
      'send_donation',
      {},
      {
        attachedDeposit: LARGE_DONATION_AMOUNT,
        gas: XCC_GAS,
      }
  )

  // Get initial forestco account balance
  const forestco_balance = await forestco.availableBalance()

  await forestco.call_raw(
      donate,
      'withdraw_donations',
      {
        amount: LARGE_DONATION_AMOUNT_RECEIVED,
      },
      {
        gas: XCC_GAS,
      }
  )

  // Assert donation contract has correct balance
  const donate_balance: string = await donate.view('get_balance', {})
  test.is(donate_balance, '0')

  // Assert forestco account has updated balance
  const forestco_new_balance = await forestco.availableBalance()
  const forestco_balance_delta = forestco_new_balance.sub(forestco_balance)
  test.log({
    balanceInitial: forestco_balance.toString(),
    balanceNew: forestco_new_balance.toString(),
    withdrawalAmount: LARGE_DONATION_AMOUNT_RECEIVED.toString(),
    withdrawalDelta: forestco_balance_delta.toString(),
  })
  test.is(forestco_balance_delta.toString().length, LARGE_DONATION_AMOUNT_RECEIVED.toString().length)
})

workspace.test('owners can withdraw fees', async (test, {zoe, alice, forestco, factory}) => {
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
  const donate = factory.getAccount(forestco.accountId.split('.')[0])
  test.true(await donate.exists())

  await alice.call(
      donate,
      'send_donation',
      {},
      {
        attachedDeposit: LARGE_DONATION_AMOUNT,
        gas: XCC_GAS,
      }
  )

  // Get initial root account balance
  const zoe_balance = await zoe.availableBalance()

  const call_raw = await zoe.call_raw(
      factory,
      'withdraw_fees',
      {
        amount: LARGE_DONATION_AMOUNT_FEES,
      },
      {
        gas: XCC_GAS
      }
  )

  // Assert factory contract has correct fees
  const factory_fees: string = await factory.view('get_fees', {})
  test.is(factory_fees, '0')

  // Assert contract owner account has updated balance
  const zoe_new_balance = await zoe.availableBalance()
  const zoe_balance_delta = zoe_new_balance.sub(zoe_balance)
  test.log({
    balanceInitial: zoe_balance.toString(),
    balanceNew: zoe_new_balance.toString(),
    withdrawalAmount: LARGE_DONATION_AMOUNT_FEES.toString(),
    withdrawalDelta: zoe_balance_delta.toString(),
  })
  test.is(zoe_balance_delta.toString().length, LARGE_DONATION_AMOUNT_FEES.toString().length - 1)
})

// For more example tests, see:
// https://github.com/near/workspaces-js/tree/main/__tests__
