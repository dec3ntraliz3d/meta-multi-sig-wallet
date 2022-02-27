# Multisig wallet - Offchain Signing 
## Built with 🏗 Scaffold-ETH

![image](https://user-images.githubusercontent.com/96781385/155885332-0788e2ac-bfe1-4acb-acfe-fa0cc7285cb5.png)


# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork :

```bash
git clone https://github.com/dec3ntraliz3d/meta-multi-sig-wallet.git

git checkout wallet-connect 
```

> install and start your 👷‍ Hardhat chain:

```bash
cd meta-multi-sig-wallet
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd meta-multi-sig-wallet
yarn start
```


 Update hardhat deploy script at `meta-multi-sig-wallet/packages/hardhat/deploy/00_deploy_multisig_wallet.js` to include address of your signer

```
await deploy("MetaMultiSigWallet", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [chainId,
      ["YOUR_MULTISIG_SIGNER_ADDRESS"],
      1],
    log: true,
    // waitConfirmations: 1,
  });

```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd meta-multi-sig-wallet
yarn deploy
```

> in a fourth terminal window, start your backend. This backend facilates gasless signing. 

```
cd meta-multi-sig-wallet/packages/backend
node index.js
```

📱 Open http://localhost:3000 to see the app

# 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)


# 💌 P.S.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!
