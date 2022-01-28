import {Contract} from "../assembly";
import {u128, VMContext} from 'near-sdk-as';
import {MIN_ACCOUNT_BALANCE} from "../../utils";


/**
 * == CONFIG VALUES ============================================================
 */
const NAME = "usain";
const FACTORY_ACCOUNT_ID = "factory";

/**
 * == HELPER FUNCTIONS =========================================================
 */
const useFactoryAsPredecessor = (): void => {
  VMContext.setPredecessor_account_id(FACTORY_ACCOUNT_ID);
};

const attachMinBalance = (): void => {
  VMContext.setAttached_deposit(MIN_ACCOUNT_BALANCE);
};

const doInitialize = (): void => {
  attachMinBalance();
  useFactoryAsPredecessor();
  contract.init()
}

let contract: Contract

beforeEach(() => {
  contract = new Contract()
})

describe("Contract", () => {

  it("creates a new factory with proper metadata", () => {
    attachMinBalance()

    contract.init()
    const a = contract.get_accounts()

    expect(a.length).toBe(0)
  })

  it("prevents double initialization", () => {
    attachMinBalance()

    contract.init()

    expect(() => {
      contract.init()
    }).toThrow("Contract is already initialized")
  })
})
