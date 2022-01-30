# near-donate-as
Accountable donation platform on NEAR protocol.

## Concept

The aim is to create a way for charitable organizations to receive donations on a blockchain. I also believe it is important for the platform to recoup a small fee for promotion and development purposes.

This proof-of-concept is in AssemblyScript, [but I am aware Rust should be used for financial use cases such as this.](https://docs.near.org/docs/develop/contracts/as/intro)

### Background

This article is a great read about what has already happened in the blockchain space for charities: https://medium.com/bpfoundation/blockchain-applications-charitable-giving-a3c50837f464

What is a charity? https://www.ionos.com/startupguide/get-started/what-is-a-charity/

## Contracts

This project is composed of two contracts.

### Factory contract

The factory contract exists to create, delete and list donation accounts, and receive platform fees.

- Creates, deletes and lists instances of Donate contract (mycharity.factory.near).
- Receives platform fees from Donate contract.
- Contract authors can withdraw platform fee.

### Donate contract

The donate contract is created for each charity, receiving donations, facilitating withdrawals, and sending platform fees.

- Receives donations from any account (myname.near), and returns award tokens.
- Charities can withdraw to charity's account (mycharity.near).
- Sends platform fee to Factory contract (factory.near).

## Future

**Give donors an equivalent quantity of a token that shows how much they have donated to a charity.** This could either be a platform-wide token (stored in the factory contract), or a charity-specific token (stored in the donate contract). Charities may give benefits or rewards to donors who hold certain amounts of their token.

**Enable factory-owned donation contracts to boost growth.** 
Donation accounts could be created on behalf of charities, and with a disclaimer, we send any donations on to that charity. Perhaps we can integrate with DeFi to facilitate cross-chain donations (some charities may already accept donations on other blockchains). Unsure how this would best work with fiat.

## Learning

Here are some of the resources used when creating this project:

- [YouTube: NEAR from Scratch: AssemblyScript Project Setup](https://www.youtube.com/watch?v=QP7aveSqRPo)
- [GitHub: starter--near-sdk-as](https://github.com/Learn-NEAR/starter--near-sdk-as)
- [GitHub: NCD.L1.sample--meme-museum](https://github.com/Learn-NEAR/NCD.L1.sample--meme-museum)
- [GitHub: simulation-testing](https://github.com/near-examples/simulation-testing)
- [StackOverflow: Contract Predecessor vs Signer vs Current](https://stackoverflow.com/questions/67297064/contract-predecessor-vs-signer-vs-current/67300205#67300205)
- [NEAR Docs: AssemblyScript](https://docs.near.org/docs/develop/contracts/as/intro)
- [NEAR Docs: Deploy Smart Contracts to MainNet](https://docs.near.org/docs/tutorials/contracts/general/deploy-to-mainnet)
- [NEAR Docs: Source Code Survey](https://docs.near.org/docs/roles/integrator/errors/error-implementation#actionerrorkind)
