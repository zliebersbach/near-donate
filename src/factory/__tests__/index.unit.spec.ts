import {Contract} from "../assembly";
import {VMContext} from 'near-sdk-as';

let contract: Contract

beforeEach(() => {
  contract = new Contract()
})

describe("Contract", () => {
  // VIEW method tests

  it("greets world", () => {
    expect(contract.greetWorld()).toStrictEqual("hello, world!")
  })

  // CHANGE method tests

  it("greets me", () => {
    const testerAccountId = 'tester';
    VMContext.setSigner_account_id(testerAccountId);

    expect(contract.greetMe()).toStrictEqual(`hello, ${testerAccountId}!`)
  })
})
