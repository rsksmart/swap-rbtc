// How to run the script: npx hardhat run ./hardhat/scripts/getSideToken.js --network rsktestnet
const hardhat = require('hardhat')

async function main() {
  const {deployments} = hardhat;
  [deployer] = await hardhat.ethers.getSigners();
  

  const Swap = await deployments.getArtifact('SwapRBTC');
 
  const swapContract = new hardhat.ethers.Contract('0x48288D0e3079A03f6EC1846554CFc58C2696Aaee', Swap.abi, deployer);

    const response = await swapContract.containsSideTokenBtc('0xb8aE2CB769255359190fBcE89d3aD38687da5e65');
    console.log("response: ",response);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
