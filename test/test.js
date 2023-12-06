const { deployIBC } = require("../scripts/deploy");
const { assert } = require('chai');

describe('IBCHandlerTest', async function () {
    const mockClientType = "mock-client";
    const mockPortId = "mock";

    let ibcHandler;

    before(async function () {
        const [deployer] = await hre.ethers.getSigners();
        ibcHandler = await deployIBC(deployer);
    })

    it('should deploy', async function () {
        assert.notEqual(ibcHandler, null);
    })

    it('should returns the correct prefix', async function () {
        const prefix = await ibcHandler.getCommitmentPrefix();
        assert.equal(prefix, 0x696263);
    })

    it('should register a mock client', async function () {
        const mockClient = await hre.ethers.deployContract("MockClient", [ibcHandler.target]);
        await mockClient.waitForDeployment();
        await ibcHandler.registerClient(mockClientType, mockClient.target);
        const addr = await ibcHandler.getClientByType(mockClientType);
        assert.equal(mockClient.target, addr);
    })

    it('should bind the MockApp to a port', async function () {
        const mockApp = await hre.ethers.deployContract("IBCMockApp", [ibcHandler.target]);
        await mockApp.waitForDeployment();
        await ibcHandler.bindPort(mockPortId, mockApp.target);
    })
})
