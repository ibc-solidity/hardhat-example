const hre = require("hardhat");

async function deploy(deployer, contractName, args = []) {
  const factory = await hre.ethers.getContractFactory(contractName);
  const contract = await factory.connect(deployer).deploy(...args);
  await contract.waitForDeployment();
  return contract;
}

async function deployIBC(deployer) {
  const logicNames = [
    "IBCClient",
    "IBCConnectionSelfStateNoValidation",
    "IBCChannelHandshake",
    "IBCChannelPacketSendRecv",
    "IBCChannelPacketTimeout",
    "IBCChannelUpgradeInitTryAck",
    "IBCChannelUpgradeConfirmOpenTimeoutCancel"
  ];
  const logics = [];
  for (const name of logicNames) {
    const logic = await deploy(deployer, name);
    logics.push(logic.target);
  }
  return await deploy(deployer, "OwnableIBCHandler", logics);
}

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await hre.ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.getAddress())).toString());

  const ibcHandler = await deployIBC(deployer);
  console.log("IBCHandler address:", ibcHandler.target);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployIBC = deployIBC;
