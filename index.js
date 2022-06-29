//import
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connect");
connectButton.addEventListener("click", connect);
const fundingButton = document.getElementById("funding");
fundingButton.addEventListener("click", fund);
const balanceButton = document.getElementById("balance");
balanceButton.addEventListener("click", getBalance);
const withdrawButton = document.getElementById("withdraw");
withdrawButton.addEventListener("click", withdraw);

async function connect() {
  if (window.ethereum != "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("Connected to Ethereum");
    connectButton.innerHTML = "Connected to Ethereum";
    connectButton.disabled = true;
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`funding with ${ethAmount}`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Funding complete");
    } catch (e) {
      console.log(e);
    }
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Withdraw complete");
    } catch (e) {
      console.log(e);
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(`Balance: ${ethers.utils.formatEther(balance)}`);
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionRecipt) => {
      console.log(
        `Completed with ${transactionRecipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
