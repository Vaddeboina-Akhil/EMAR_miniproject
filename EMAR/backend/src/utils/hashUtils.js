const crypto = require('crypto');

/**
 * Generate SHA256 hash of record data
 * Used for blockchain verification and tamper detection
 */
function generateRecordHash(recordData) {
  if (!recordData) return null;

  // Create a consistent hash by stringifying the important fields
  const dataToHash = JSON.stringify({
    patientId: recordData.patientId,
    patientName: recordData.patientName,
    recordType: recordData.recordType,
    diagnosis: recordData.diagnosis,
    doctorId: recordData.doctorId,
    doctorName: recordData.doctorName,
    visitDate: recordData.visitDate,
    hospitalName: recordData.hospitalName,
    medicines: recordData.medicines,
    notes: recordData.notes
  });

  const hash = crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex');

  console.log(`🔐 Generated hash for record: ${hash.substring(0, 16)}...`);
  return hash;
}

/**
 * Verify if record has been tampered with
 * Compares current data hash with blockchain hash
 */
function verifyRecordIntegrity(currentData, blockchainHash) {
  if (!blockchainHash) {
    // No blockchain hash yet, can't verify
    return { valid: true, isTampered: false, reason: 'no_blockchain_hash' };
  }

  const currentHash = generateRecordHash(currentData);

  if (currentHash === blockchainHash) {
    return { valid: true, isTampered: false };
  } else {
    return { valid: false, isTampered: true, reason: 'hash_mismatch' };
  }
}

module.exports = {
  generateRecordHash,
  verifyRecordIntegrity
};
