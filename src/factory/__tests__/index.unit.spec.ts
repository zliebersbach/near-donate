import {Contract} from "../assembly";
import {VMContext} from 'near-sdk-as';

let contract: Contract

beforeEach(() => {
  contract = new Contract()
})

describe("Contract", () => {
  // CHANGE method tests

  it("creates account", () => {
    const testerAccountId = 'tester'
    VMContext.setSigner_account_id(testerAccountId)

    expect(contract.create_account()).toStrictEqual(`donate.${testerAccountId}`)
  })

  // TODO: This needs to be a simulation test!
  it("creates account and call method", () => {
    const testerAccountId = 'tester'
    VMContext.setSigner_account_id(testerAccountId)

    expect(contract.create_account()).toStrictEqual(`donate.${testerAccountId}`)
  })
})
