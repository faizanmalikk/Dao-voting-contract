import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  networkConfig,
  developmentChains,
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
} from "../helper-hardhat-config"
import verify from "../utils/verify";

const deployGovernorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const governanceToken = await get("GoveranceToken")
  const timeLock = await get("TimeLock")
  const args = [
      governanceToken.address,
      timeLock.address,
      VOTING_DELAY,
      VOTING_PERIOD,
      QUORUM_PERCENTAGE,
  ]
  
  log("----------------------------------------------------")
  log("Deploying GovernorContract and waiting for confirmations...")
  const governorContract = await deploy("GoveranceContract", {
    from: deployer,
    args, 
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  log(`GovernorContract at ${governorContract.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(governorContract.address, args)
  }
}

export default deployGovernorContract
deployGovernorContract.tags = ["all", "governor"]