// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EMARBlockchain
 * @dev Smart contract for EMAR medical record blockchain verification
 * Stores hash of medical records for tamper detection
 */
contract EMARBlockchain {
    // Owner of the contract
    address public owner;
    
    // System frozen flag
    bool public systemFrozen = false;
    string public freezeReason = "";
    
    // Mapping of recordId -> hash
    mapping(string => string) public recordHashes;
    
    // Mapping of recordId -> transaction hash
    mapping(string => string) public recordTxHashes;
    
    // Event for hash storage
    event HashStored(string indexed recordId, string hash, uint256 timestamp);
    
    // Event for system freeze
    event SystemFrozen(string reason, uint256 timestamp);
    
    // Event for system unfreeze
    event SystemUnfrozen(uint256 timestamp);
    
    // Modifier to check if caller is owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    // Modifier to check if system is frozen
    modifier systemNotFrozen() {
        require(!systemFrozen, "System is frozen");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Store hash of medical record
     * @param recordId - Unique record identifier
     * @param hash - SHA256 hash of record data
     */
    function storeHash(string memory recordId, string memory hash) 
        public 
        onlyOwner 
        systemNotFrozen 
    {
        require(bytes(recordId).length > 0, "Record ID cannot be empty");
        require(bytes(hash).length > 0, "Hash cannot be empty");
        
        recordHashes[recordId] = hash;
        recordTxHashes[recordId] = toHexString(keccak256(abi.encodePacked(recordId, hash, block.timestamp)));
        
        emit HashStored(recordId, hash, block.timestamp);
    }
    
    /**
     * @dev Retrieve hash of medical record
     * @param recordId - Unique record identifier
     * @return hash of the record
     */
    function getHash(string memory recordId) 
        public 
        view 
        returns (string memory) 
    {
        return recordHashes[recordId];
    }
    
    /**
     * @dev Verify if record hash matches stored hash
     * @param recordId - Unique record identifier
     * @param hash - Hash to verify
     * @return true if hash matches, false otherwise
     */
    function verifyHash(string memory recordId, string memory hash) 
        public 
        view 
        returns (bool) 
    {
        return keccak256(abi.encodePacked(recordHashes[recordId])) == 
               keccak256(abi.encodePacked(hash));
    }
    
    /**
     * @dev Freeze system (block all writes)
     * @param reason - Reason for freezing
     */
    function freezeSystem(string memory reason) 
        public 
        onlyOwner 
    {
        systemFrozen = true;
        freezeReason = reason;
        emit SystemFrozen(reason, block.timestamp);
    }
    
    /**
     * @dev Unfreeze system (resume operations)
     */
    function unfreezeSystem() 
        public 
        onlyOwner 
    {
        systemFrozen = false;
        freezeReason = "";
        emit SystemUnfrozen(block.timestamp);
    }
    
    /**
     * @dev Check if system is frozen
     * @return true if system is frozen
     */
    function isSystemFrozen() 
        public 
        view 
        returns (bool) 
    {
        return systemFrozen;
    }
    
    /**
     * @dev Convert bytes32 to hex string
     */
    function toHexString(bytes32 value) 
        internal 
        pure 
        returns (string memory) 
    {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory result = new bytes(64);
        
        for (uint256 i = 0; i < 32; i++) {
            uint8 value_ = uint8(value[i]);
            result[i * 2] = hexChars[value_ >> 4];
            result[i * 2 + 1] = hexChars[value_ & 0x0f];
        }
        
        return string(result);
    }
}
