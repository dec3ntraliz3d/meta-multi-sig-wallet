// deploy/00_deploy_multisig_wallet.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("MetaMultiSigWallet", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [chainId,
      ["0xB7dE865F28abDFa413933c2605f56ced7D53a423"],
      1],
    log: true,
    // waitConfirmations: 1,
  });

  // Getting a previously deployed contract
  //const multisigContract = await ethers.getContract("MetaMultiSigWallet", deployer);

  // Verify from the command line by running `yarn verify`

  // You can also Verify your contracts with Etherscan here...
  // You don't want to verify on localhost
  // try {
  //   if (chainId !== localChainId) {
  //     await run("verify:verify", {
  //       address: multisigContract.address,
  //       contract: "contracts/MetaMultiSigWallet.sol:MetaMultiSigWallet",
  //       contractArguments: [chainId, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 1],
  //     });
  //   }
  // } catch (error) {
  //   console.error(error);
  // }
};
module.exports.tags = ["MetaMultiSigWallet"];
