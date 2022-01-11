
const { ethers, waffle} = require("hardhat");

const main = async () => {
    const dividendTokenFactory = await hre.ethers.getContractFactory("DividendToken");
    const dividendToken = await dividendTokenFactory.deploy("Roderick of Schtauffen", "ROS");
    await dividendToken.deployed();
    const provider = waffle.provider;
    const [owner, user1, user2, user3, user4] = await ethers.getSigners();
    console.log("user1 balance: ", await provider.getBalance(user1.address));
    console.log("user2 balance: ", await provider.getBalance(user2.address));
    console.log("user3 balance: ", await provider.getBalance(user3.address));
    await dividendToken.transfer(user1.address, BigInt(1000));
    await dividendToken.transfer(user2.address, BigInt(2000));
    await dividendToken.transfer(user3.address, BigInt(4000));
    const transactionHash = await owner.sendTransaction({
        to: dividendToken.address,
        value: ethers.utils.parseEther("8000.0"),
    });
    console.log("owner balance: ", await provider.getBalance(owner.address));
    await dividendToken.transfer(user1.address, BigInt(1));
    await dividendToken.transfer(user2.address, BigInt(1));
    await dividendToken.transfer(user3.address, BigInt(1));
    console.log("owner balance: ", await provider.getBalance(owner.address));
    console.log("user1 balance: ", await provider.getBalance(user1.address));
    console.log("user2 balance: ", await provider.getBalance(user2.address));
    console.log("user3 balance: ", await provider.getBalance(user3.address));
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();