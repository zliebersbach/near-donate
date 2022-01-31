import {Contract} from "../assembly";
import {u128, VMContext} from 'near-sdk-as';
import {MIN_ACCOUNT_BALANCE, ONE_NEAR} from "../../utils";


/**
 * == CONFIG VALUES ============================================================
 */
const ALICE_ACCOUNT_ID = "alice";

/**
 * == HELPER FUNCTIONS =========================================================
 */
const attachMinBalance = (): void => {
  VMContext.setAttached_deposit(MIN_ACCOUNT_BALANCE);
};

const doInitialize = (): void => {
  attachMinBalance();
  contract.init([ALICE_ACCOUNT_ID])
}

let contract: Contract

beforeEach(() => {
  contract = new Contract()
})

describe("Contract", () => {

  it("creates a new factory with proper metadata", () => {
    doInitialize()

    const a = contract.get_accounts()
    expect(a.length).toBe(0)

    const o = contract.get_owners()
    expect(o.length).toBe(1)
    expect(o[0]).toBe(ALICE_ACCOUNT_ID)

    const f = contract.get_fees()
    expect(f).toBe(u128.Zero)
  })

  it("create fails with no owners", () => {
    attachMinBalance()

    expect(() => {
      contract.init([])
    }).toThrow("Must specify at least 1 owner")
  })

  it("create fails with invalid owner", () => {
    attachMinBalance()

    expect(() => {
      contract.init(["%--6"])
    }).toThrow("Owner account must have valid NEAR account name")
  })

  it("prevents double initialization", () => {
    doInitialize()

    expect(() => {
      contract.init([ALICE_ACCOUNT_ID])
    }).toThrow("Contract is already initialized")
  })

  it("prevents fee deposits when not account", () => {
    doInitialize()

    expect(() => {
      contract.deposit_fees()
    }).toThrow("This function can only be called by accounts")
  })

  it("prevents fee withdrawals when not owner", () => {
    doInitialize()

    expect(() => {
      contract.withdraw_fees(ONE_NEAR)
    }).toThrow("This function can only be called by owners")
  })
})
