import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { networkConfig, developmentChains, MIN_DELAY } from "../helper-hardhat-config"
import verify from "../utils/verify"

const deployTimeLock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying TimeLock and waiting for confirmations...")
  const timeLock = await deploy("TimeLock", {
    from: deployer,

    args: [MIN_DELAY, [], [], deployer],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  log(`TimeLock at ${timeLock.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(timeLock.address, [])
  }
}

export default deployTimeLock
deployTimeLock.tags = ["all", "timelock"]