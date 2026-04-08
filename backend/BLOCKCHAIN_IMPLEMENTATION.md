# EMAR Blockchain Security Layer

## Overview

This document explains the blockchain security layer added to EMAR. It's a non-invasive add-on that enhances security without breaking existing functionality.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────┐
│                   EMAR System                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐         ┌──────────────┐         │
│  │   Frontend   │◄───────►│  REST API    │         │
│  └──────────────┘         └──────────────┘         │
│                                │                    │
│                          ┌─────▼─────┐             │
│                          │  MongoDB   │             │
│                          │  Database  │             │
│                          └───────────┘             │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │     BLOCKCHAIN SECURITY LAYER (ADD-ON)       │ │
│  ├──────────────────────────────────────────────┤ │
│  │ • Hash Generation (SHA256)                   │ │
│  │ • Hash Storage (Blockchain)                  │ │
│  │ • Tamper Detection                           │ │
│  │ • System Freeze/Unfreeze                     │ │
│  └──────────────────────────────────────────────┘ │
│                           │                        │
│                    ┌──────▼──────┐                │
│                    │ Blockchain  │                │
│                    │ (Ethereum)  │                │
│                    └─────────────┘                │
└─────────────────────────────────────────────────────┘
```

### Key Features

1. **Hash Generation** - SHA256 hash of every medical record
2. **Blockchain Storage** - Store hash on Ethereum/blockchain for verification
3. **Tamper Detection** - Compare stored hash with blockchain hash
4. **System Freeze** - Auto-freeze system if tampering detected
5. **Admin Control** - Admin can manually freeze/unfreeze

## Implementation Details

### 1. Services

#### `backend/src/services/blockchainService.js`
- Connects to blockchain via ethers.js
- Stores and retrieves record hashes
- Handles blockchain failures gracefully

**Key Functions:**
```javascript
await storeRecordHash(recordId, hash)    // Store hash on blockchain
await getRecordHash(recordId)             // Retrieve hash from blockchain
await isSystemFrozen()                    // Check system freeze status
```

### 2. Utilities

#### `backend/src/utils/hashUtils.js`
- Generates SHA256 hash of record data
- Verifies record integrity
- Detects tampering

**Key Functions:**
```javascript
generateRecordHash(recordData)            // Create SHA256 hash
verifyRecordIntegrity(data, blockHash)    // Check if data matches blockchain
```

### 3. Database Models

#### `backend/src/models/SystemStatus.js`
Single-document collection tracking system state:
```json
{
  "isFrozen": boolean,
  "reason": string,
  "frozenAt": Date,
  "updatedAt": Date
}
```

#### `MedicalRecord.js` - New Fields
```javascript
blockchainHash: String,          // Record hash stored on blockchain
blockchainTxHash: String,        // Blockchain transaction ID
isTampered: Boolean,             // Flag if tampering detected
tamperedDetectedAt: Date         // When tampering was detected
```

### 4. Middleware

#### `backend/src/middleware/systemCheck.js`
- Intercepts all API requests
- Blocks write operations (POST, PUT, DELETE) if system is frozen
- Allows read operations even if frozen
- Fails gracefully if check fails

### 5. Integration Points

#### Record Upload (Controller)
When a record is uploaded:
1. Record is saved to MongoDB
2. Hash is generated from record data
3. Hash is stored on blockchain
4. Transaction hash is recorded

```javascript
// In recordController.js
const hash = generateRecordHash(record);
await storeRecordHash(record._id.toString(), hash);
record.blockchainHash = hash;
await record.save();
```

#### Record Fetch (Controller)
When a record is retrieved:
1. Record is fetched from MongoDB
2. Hash is retrieved from blockchain
3. Hashes are compared
4. `isTampered` flag is set if mismatch

```javascript
const blockchainHash = await getRecordHash(recordId);
const currentHash = generateRecordHash(record);
if (blockchainHash !== currentHash) {
  record.isTampered = true;
  // Auto-freeze system
  await freezeSystem("Blockchain mismatch detected");
}
```

### 6. Admin APIs

#### Get System Status
```
GET /api/admin/system/status
Response:
{
  "isFrozen": false,
  "reason": "",
  "frozenAt": null,
  "updatedAt": "2024-04-08T10:00:00Z"
}
```

#### Freeze System
```
POST /api/admin/system/freeze
Body: { "reason": "Suspicious activity detected" }
```

#### Unfreeze System
```
POST /api/admin/system/unfreeze
Body: { "reason": "Issue resolved" }
```

## Setup Instructions

### Step 1: Install Dependencies
```bash
cd backend
npm install ethers
```

### Step 2: Configure Environment

Update `.env` with blockchain details:
```
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0x...deployed_contract_address
```

### Step 3: Deploy Smart Contract

The Solidity contract is in `backend/contracts/EMARBlockchain.sol`

Using Hardhat:
```bash
npm install --save-dev hardhat
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

### Step 4: Start Blockchain (Local Testing)

Using Ganache (local Ethereum):
```bash
npm install -g ganache
ganache --deterministic
```

This starts Ethereum at http://localhost:8545

### Step 5: Run Backend
```bash
npm run dev
```

## Failure Modes & Safety

### If Blockchain is Down
- Records still upload normally
- Hash storage fails silently
- System continues operating
- No data loss

### If Hash Mismatch Detected
- `isTampered` flag is set
- System auto-freezes
- All writes are blocked
- Admin can investigate and unfreeze

### If Middleware Fails
- Request continues anyway
- No blocking of operations
- System stays operational
- Fail-safe design

## Frontend Integration

### System Lock Banner
Shows when system is frozen:

```jsx
import { SystemLockBanner } from './hooks/useSystemStatus';

function App() {
  return (
    <>
      <SystemLockBanner />
      {/* Rest of app */}
    </>
  );
}
```

### Checking Freeze Status
```jsx
const { isFrozen, reason } = useSystemStatus();

if (isFrozen) {
  // Show lock message
}
```

## Testing

### Test 1: Normal Upload
```bash
1. Upload medical record
2. Check MongoDB - record saved
3. Check blockchain - hash stored
4. Both should match
```

### Test 2: Tamper Detection
```bash
1. Upload record
2. Manually modify record in MongoDB (change diagnosis)
3. Fetch record
4. Check: isTampered = true, system frozen
```

### Test 3: System Freeze/Unfreeze
```bash
1. POST /api/admin/system/freeze
2. Try to upload record - should fail with 403
3. Be to read records - should work
4. POST /api/admin/system/unfreeze
5. Uploads work again
```

## Security Considerations

### What Blockchain Protects
- ✅ Detects if record data was modified
- ✅ Creates immutable audit trail
- ✅ Prevents unauthorized edits

### What Blockchain Doesn't Protect
- ❌ Database loss (still need backups)
- ❌ Unauthorized access prevention (use auth)
- ❌ Data encryption (use TLS)

### Threat Scenarios

**Scenario 1: Attacker modifies record in DB**
- Hash mismatch detected
- System auto-freezes
- Admin investigates
- ✅ Protected

**Scenario 2: Attacker tries to inject new record**
- New records get blockchain hash
- Can verify authenticity via blockchain
- ✅ Protected

**Scenario 3: Attacker modifies record + blockchain**
- Blockchain is immutable (can't change past hashes)
- Attack requires controlling blockchain nodes
- Very high cost
- ✅ Protected

## Production Checklist

- [ ] Deploy to mainnet or reputable testnet
- [ ] Set up private key management (AWS KMS / HashiCorp Vault)
- [ ] Configure gas price limits
- [ ] Set up monitoring for blockchain failures
- [ ] Configure backup blockchain RPC endpoints
- [ ] Test freeze/unfreeze procedures
- [ ] Document admin procedures
- [ ] Train staff on system freeze processes
- [ ] Set up alerts for tampering detection
- [ ] Regular backup of blockchain transaction history

## Troubleshooting

### Contract Address Not Set
```
Error: Contract initialization failed
Fix: Set CONTRACT_ADDRESS in .env
```

### Private Key Invalid
```
Error: Invalid private key format
Fix: Use unencrypted private key (0x... format)
```

### Blockchain Not Responding
```
Error: Connection timeout
Fix: Check BLOCKCHAIN_RPC_URL, ensure blockchain is running
```

### Records Not Getting Blockchain Hash
```
Check logs: "Blockchain write failed"
Fix: May be temporary - will retry on next operation
System continues to work, just without blockchain verification
```

## Future Enhancements

1. **Automated Monitoring** - Alert on tamper detection
2. **Batch Hashing** - Optimize gas costs
3. **Multi-sig Admin** - Require multiple admins to unfreeze
4. **Proof Generation** - Generate cryptographic proofs
5. **Cross-chain Verification** - Store hashes on multiple chains
6. **Insurance Integration** - Automatic claims on tampering

## References

- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Solidity Documentation](https://solidity.readthedocs.io/)
- [Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
