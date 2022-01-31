# near-donate-as
Accountable donation platform on NEAR protocol.

[![Build + Test](https://github.com/zliebersbach/near-donate-as/actions/workflows/build-test.yml/badge.svg)](https://github.com/zliebersbach/near-donate-as/actions/workflows/build-test.yml)

## Concept

The aim is to create a way for charitable organizations to receive donations on a blockchain. I also believe it is important for the platform to recoup a small fee for promotion and development purposes.

This proof-of-concept is in AssemblyScript, [but I am aware Rust should be used for financial use cases such as this.](https://docs.near.org/docs/develop/contracts/as/intro)

### Background

This article is a great read about what has already happened in the blockchain space for charities: https://medium.com/bpfoundation/blockchain-applications-charitable-giving-a3c50837f464

What is a charity? https://www.ionos.com/startupguide/get-started/what-is-a-charity/

## Usage

Unit tests are written in `as-pect` and simulation tests are written in `ava` (using `near-workspaces-ava`). 

### Build and test

```shell
$ yarn                          # Install dependencies
$ yarn build                    # Build contracts (WASM files)
$ yarn test                     # Run unit tests
$ yarn test:workspaces          # Run workspaces (simulation) tests
$ yarn test:workspaces:testnet  # Run workspaces (simulation) tests on testnet
```

### Run on testnet

```shell
$ ./scripts/0.deploy-factory.sh       # Deploys the contract
$ ./scripts/1.add-donation-account.sh # Creates a new donation account
$ ./scripts/2.send-donation.sh        # Send a donation to the donation account
$ ./scripts/3a.withdraw-donations.sh  # Withdraw donations to the charity account
$ ./scripts/3b.withdraw-fees.sh       # Withdraw platform fees to an owner account
$ ./scripts/x.cleanup.sh              # Cleanup the environment
```

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

**1% for the planet, 1% for the platform philosophy.** Would be great to integrate with NEAR projects like Open Forest Protocol (OFP) to automatically commit a further 1% of donations to support their projects. 

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
