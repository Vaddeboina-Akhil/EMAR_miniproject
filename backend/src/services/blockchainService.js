const { ethers } = require('ethers');

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

const contractABI = [
  'function storeHash(string memory recordId, string memory hash) public',
  'function getHash(string memory recordId) public view returns (string memory)',
  'function isSystemFrozen() public view returns (bool)',
  'function freezeSystem(string memory reason) public',
  'function unfreezeSystem() public'
];

const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

let contract = null;

// Initialize contract (only if blockchain is configured)
function initializeContract() {
  if (!contractAddress || !privateKey || !provider) {
    console.log('⚠️ Blockchain not configured, running in fallback mode');
    return null;
  }

  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, contractABI, wallet);
    console.log('✅ Blockchain contract initialized');
    return contract;
  } catch (err) {
    console.log('⚠️ Blockchain initialization failed, running in fallback mode:', err.message);
    return null;
  }
}

// Store record hash on blockchain
async function storeRecordHash(recordId, hash) {
  if (!contract) {
    console.log('📝 Blockchain not available, skipping hash storage');
    return { success: false, reason: 'blockchain_unavailable' };
  }

  try {
    console.log(`📤 Storing hash for record ${recordId} on blockchain...`);
    const tx = await contract.storeHash(recordId, hash);
    const receipt = await tx.wait();
    console.log(`✅ Hash stored on blockchain, tx: ${receipt.transactionHash}`);
    return { success: true, txHash: receipt.transactionHash };
  } catch (err) {
    console.error('❌ Blockchain write failed:', err.message);
    return { success: false, reason: err.message };
  }
}

// Retrieve hash from blockchain
async function getRecordHash(recordId) {
  if (!contract) {
    console.log('📝 Blockchain not available, skipping hash retrieval');
    return null;
  }

  try {
    const hash = await contract.getHash(recordId);
    if (hash && hash !== '') {
      console.log(`✅ Retrieved hash for record ${recordId} from blockchain`);
      return hash;
    }
    return null;
  } catch (err) {
    console.error('❌ Failed to retrieve hash:', err.message);
    return null;
  }
}

// Check if system is frozen (read-only, should work even if blockchain is slow)
async function isSystemFrozen() {
  if (!contract) {
    return false; // Default: system is not frozen if blockchain unavailable
  }

  try {
    return await contract.isSystemFrozen();
  } catch (err) {
    console.error('❌ Failed to check system freeze status:', err.message);
    return false;
  }
}

// Initialize on module load
initializeContract();

module.exports = {
  storeRecordHash,
  getRecordHash,
  isSystemFrozen,
  initializeContract
};
