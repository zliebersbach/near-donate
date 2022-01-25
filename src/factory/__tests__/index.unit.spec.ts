import { Contract } from "../assembly";

let contract: Contract

beforeEach(() => {
  contract = new Contract()
})

describe("Contract", () => {
  // VIEW method tests

  it("says hello", () => {
    expect(contract.greetWorld()).toStrictEqual("hello, world!")
  })
})
