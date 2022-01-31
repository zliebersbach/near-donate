import {Contract} from "../assembly";
import {u128, VMContext} from 'near-sdk-as';
import {MIN_ACCOUNT_BALANCE, ONE_NEAR} from "../../utils";


/**
 * == CONFIG VALUES ============================================================
 */
const ALICE_ACCOUNT_ID = "alice";
const FORESTCO_ACCOUNT_ID = "forestco";

/**
 * == HELPER FUNCTIONS =========================================================
 */
const attachMinBalance = (): void => {
  VMContext.setAttached_deposit(MIN_ACCOUNT_BALANCE);
};

const doInitialize = (): void => {
  attachMinBalance();
  contract.init(FORESTCO_ACCOUNT_ID)
}

let contract: Contract

beforeEach(() => {
  contract = new Contract()
})

describe("Contract", () => {

  it("creates a new dontaion account with proper metadata", () => {
    doInitialize()

    const d = contract.get_donations()
    expect(d.length).toBe(0)

    const o = contract.get_owner()
    expect(o).toBe(FORESTCO_ACCOUNT_ID)

    const f = contract.get_balance()
    expect(f).toBe(u128.Zero)
  })

  it("create fails with invalid owner", () => {
    attachMinBalance()

    expect(() => {
      contract.init("%--6")
    }).toThrow("Owner account must have valid NEAR account name")
  })

  it("prevents double initialization", () => {
    doInitialize()

    expect(() => {
      contract.init(FORESTCO_ACCOUNT_ID)
    }).toThrow("Contract is already initialized")
  })

  it("prevents donation withdrawals when not owner", () => {
    doInitialize()

    expect(() => {
      contract.withdraw_donations(ONE_NEAR)
    }).toThrow("Must be called by owner. e.g. myorg.near if your donation account is myorg.donate.near")
  })
})
