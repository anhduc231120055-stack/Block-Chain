import { ethers } from "hardhat";

async function main() {
  const recipients = [
    "0xdDfF900CE5c86E3407f111b0eF6ed67B218dD9A4",
    "0x921cC3791055eBc51BF18F960067B1f32a81f037",
  ];
  const [sender] = await ethers.getSigners();

  for (const recipient of recipients) {
    console.log(`Sending 1000 ETH to ${recipient}...`);
    const tx = await sender.sendTransaction({
      to: recipient,
      value: ethers.parseEther("1000"),
    });
    await tx.wait();
    const balance = await ethers.provider.getBalance(recipient);
    console.log(`Success! New balance of ${recipient}: ${ethers.formatEther(balance)} ETH`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
