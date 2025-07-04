// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;


// Basic SettleMaker for tests without governance
contract OTCCourt {

    event submitMessageEvent(bytes32 indexed _id, address indexed _sender, bytes _calldata, bytes _msg);
    event batchRootSubmittedEvent(uint256 indexed _batchNumber, bytes32 _root);
    
    mapping(uint256 => bytes32) public batchRoot;
    uint256 public batchNumber;

    //@dev modify to be only callable by Muon
    function submitBatchRoot(bytes32 root, bytes calldata data) external {
        batchRoot[batchNumber] = root;
        emit batchRootSubmittedEvent(batchNumber, root);
        batchNumber++;
    }   

    //@dev PSYMM custody state change, if state change to 1, SettleMaker validator will check submissions here (only on submission event from here ). 
    function submitMessage(bytes32 _id, bytes calldata _calldata, bytes calldata _msg) external { emit submitMessageEvent(_id, msg.sender, _calldata, _msg);}
 


}

