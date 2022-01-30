import {Contract} from "../assembly";
import {u128, VMContext} from 'near-sdk-as';
import {MIN_ACCOUNT_BALANCE} from "../../utils";


/**
 * == CONFIG VALUES ============================================================
 */
const USAIN_ACCOUNT_ID = "usain";
const FACTORY_ACCOUNT_ID = "factory";

/**
 * == HELPER FUNCTIONS =========================================================
 */
const useFactoryAsPredecessor = (): void => {
  VMContext.setPredecessor_account_id(FACTORY_ACCOUNT_ID);
};
const useUsainAsPredecessor = (): void => {
  VMContext.setPredecessor_account_id(USAIN_ACCOUNT_ID);
};

const attachMinBalance = (): void => {
  VMContext.setAttached_deposit(MIN_ACCOUNT_BALANCE);
};

const doInitialize = (): void => {
  attachMinBalance();
  contract.init([USAIN_ACCOUNT_ID])
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
    expect(o[0]).toBe(USAIN_ACCOUNT_ID)
  })

  it("create fails with no owners", () => {
    attachMinBalance()

    expect(() => {
      contract.init([])
    }).toThrow("Must specify at least 1 owner")
  })

  it("prevents double initialization", () => {
    doInitialize()

    expect(() => {
      contract.init([USAIN_ACCOUNT_ID])
    }).toThrow("Contract is already initialized")
  })
})
