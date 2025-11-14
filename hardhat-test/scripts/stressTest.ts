import { network } from "hardhat";
const { ethers } = await network.connect()

console.log("Sending transaction using the OP chain type");

const [sender] = await ethers.getSigners();

console.log("Sending 1 wei from", sender.address, "to itself");

console.log("Sending L2 transaction");
const tx = await sender.sendTransaction({
  to: sender.address,
  value: 1n,
});

await tx.wait();

console.log("Transaction sent successfully");

// Overload test
const NUMTRANSACTIONS = 300;
const [signer] = await ethers.getSigners();
const recipientAddress = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"
const amountToSend = 1n;

console.log(`Sending ${NUMTRANSACTIONS} transactions of ${amountToSend} wei to ${recipientAddress}`);

const txPromises = [];
for (let i = 0; i < NUMTRANSACTIONS; i++) {
  const txPromise = signer.sendTransaction({
    to: recipientAddress,
    value: amountToSend,
    nonce: await signer.getNonce() + i, // Ensure unique nonce for each transaction
  }).catch(e => {
    console.error(`Transaction ${i} failed:`, e);
  });

  txPromises.push(txPromise);
}

// Sending every transaction in parallel
const results = await Promise.all(txPromises);

let successfulTxs = 0;
let confirmedTxs = 0;
// Waiting for all transactions to be mined
for (const tx of results.filter(tx => tx !== undefined)) {
  successfulTxs++;
  try {
    await tx.wait();
    confirmedTxs++;
  } catch (e) {
    console.error("Error waiting for transaction confirmation:", e);
  }

  console.log(`\n--- Resultados ---`);
  console.log(`Transações enviadas com sucesso (para o nó): ${successfulTxs}`);
  console.log(`Transações confirmadas na rede: ${confirmedTxs}`);
}