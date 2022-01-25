# near-donate
Accountable donation platform on NEAR protocol.

## Design

The aim is to create a way for charitable organizations to receive donations on a blockchain, while also giving donors an equivalent quantity of a token that shows how much they have donated. I also believe it is important for the platform to recoup a small fee for promotion and development purposes.

### Factory contract

**Stage 1**
- Creates and deletes instances of Donate contract (donate.mycharity.near).

**Stage 2**
- Receives platform fees from Donate contract.
- Contract authors can withdraw platform fee.

### Donate contract

**Stage 1**
- Receives donations from any account (myname.near), and returns award tokens.
- Charities can withdraw to main account (mycharity.near).

**Stage 2**
- Sends platform fee to Factory contract.

## Background

This article is a great read about what has already happened in the blockchain space for charities: https://medium.com/bpfoundation/blockchain-applications-charitable-giving-a3c50837f464

What is a charity? https://www.ionos.com/startupguide/get-started/what-is-a-charity/

## Learning

Here are some of the resources used when creating this project:

- [YouTube: NEAR from Scratch: AssemblyScript Project Setup](https://www.youtube.com/watch?v=QP7aveSqRPo)
- [GitHub: starter--near-sdk-as](https://github.com/Learn-NEAR/starter--near-sdk-as)
- [GitHub: NCD.L1.sample--meme-museum](https://github.com/Learn-NEAR/NCD.L1.sample--meme-museum)
- [GitHub: simulation-testing](https://github.com/near-examples/simulation-testing)
- [StackOverflow: Contract Predecessor vs Signer vs Current](https://stackoverflow.com/questions/67297064/contract-predecessor-vs-signer-vs-current/67300205#67300205)
- [NEAR Docs: AssemblyScript](https://docs.near.org/docs/develop/contracts/as/intro)
