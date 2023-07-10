import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";
import { ethers } from "hardhat";



const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("----------------------------------------------------")
    log("Deploying GovernanceToken and waiting for confirmations...")
    const governanceToken = await deploy("GoveranceToken", {
      from: deployer,
      args: [],
      log: true,
      // we need to wait if on a live network so we can verify properly
      waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    log(`GovernanceToken at ${governanceToken.address}`)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
      await verify(governanceToken.address, [])
    }
    log(`Delegating to ${deployer}`)
    await delegate(governanceToken.address, deployer)
    log("Delegated!")
  }
  
  const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GoveranceToken", governanceTokenAddress)
    const transactionResponse = await governanceToken.delegate(delegatedAccount)
    await transactionResponse.wait(1)
    console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`)
  }
  
  export default deployGovernanceToken
  deployGovernanceToken.tags = ["all", "governor"]