
const { ethers, waffle } = require("hardhat");
const { expect } = require("chai");

describe("Dividens token", function() {
    
    let hardhatToken;
    let dividendToken;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let provider;
    const tokenName = "Roderick of Schtauffen";
    const tokenSymbol = "ROS";
    const totalSupply = 10000;

    beforeEach(async function() {
        dividendToken = await ethers.getContractFactory("DividendToken");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        hardhatToken = await dividendToken.deploy(tokenName, tokenSymbol);
        provider = waffle.provider;
    });

    describe("Deployment", function() {
        it("Check name and symbol", async function() {
            expect(await hardhatToken.name()).to.equal(tokenName);
            expect(await hardhatToken.symbol()).to.equal(tokenSymbol);
        });
        it("Owner balance", async function() {
            expect(await hardhatToken.balanceOf(owner.address)).to.equal(totalSupply);
        });
    });

    describe("Dividends", function() {
        it("Check transfers and dividends", async function() {
            const addrs = new Map();
            addrs.set(addr1.address, 500);
            addrs.set(addr2.address, 2000);
            addrs.set(addr3.address, 300);
            let totalTokenTransferred = 0;
            addrs.forEach((v) => {
                totalTokenTransferred += v;
            });
            const sentETH = BigInt(8000 * 10 ** 18);
            const initialETH = await provider.getBalance(addr1.address);
            for (let addr of addrs.keys()) {
                await hardhatToken.transfer(addr, BigInt(addrs.get(addr)));
                expect(await hardhatToken.balanceOf(addr)).to.equal(addrs.get(addr));
            }
            
            expect(await hardhatToken.balanceOf(owner.address)).to.equal(totalSupply - totalTokenTransferred);
            await owner.sendTransaction({
                to: hardhatToken.address,
                value: sentETH,
            });

            expect(await provider.getBalance(hardhatToken.address)).to.equal(sentETH);
            for (let addr of addrs.keys()) {
                await hardhatToken.transfer(addr, BigInt(1));
                expect(await provider.getBalance(addr)).to.equal(BigInt(initialETH) + BigInt(sentETH) * BigInt(addrs.get(addr)) / BigInt(totalSupply));
            }
        });


        it("Payment of extra dividends", async function() {
            let A = addr1.address;
            let B = addr2.address;
            const initBETH = await provider.getBalance(B);
            const initAETH = await provider.getBalance(A);
            await hardhatToken.transfer(A, BigInt(5000));
            await owner.sendTransaction({
                to: hardhatToken.address,
                value: BigInt(2000 * 10 ** 18),
            });
            let totalDivs = await hardhatToken.getTotalDividends();
            ownerETH = await provider.getBalance(owner.address);
            
            await hardhatToken.transfer(B, BigInt(1000));


            await hardhatToken.connect(addr1).transfer(B, 1000);
            expect(await provider.getBalance(hardhatToken.address)).to.equal(0);

            // B didn't receive dividends
            expect(await provider.getBalance(B)).to.equal(BigInt(initBETH));

            // A received 1000ETH dividends
            expect(await provider.getBalance(A)).to.not.be.below(BigInt(initAETH) + BigInt(999 * 10 ** 18));
            // owner received 1000ETH dividends
            expect(await provider.getBalance(owner.address)).to.not.be.below(BigInt(ownerETH) + BigInt(999 * 10 ** 18));
        });
    });
});
