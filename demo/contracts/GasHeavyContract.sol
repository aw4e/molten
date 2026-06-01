// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Demo contract with intentional gas inefficiencies for testing analyze_gas tool
contract GasHeavyContract {
    uint256 public counter;
    bool public paused;
    uint256 public lastTimestamp;
    bool public initialized;
    uint256 public totalSupply;

    address[] public holders;
    mapping(address => uint256) public holdings;

    modifier notPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    // GAS ISSUE: memory instead of calldata for external param
    function batchTransfer(address[] memory recipients, uint256 amount) external notPaused {
        // GAS ISSUE: array length not cached, repeated SLOAD inside loop
        for (uint256 i = 0; i < recipients.length; i++) {
            require(holdings[msg.sender] >= amount, "Insufficient");
            holdings[msg.sender] -= amount;
            holdings[recipients[i]] += amount;
        }
    }

    // GAS ISSUE: redundant storage reads
    function updateCounter() external notPaused {
        counter = counter + 1;
        lastTimestamp = block.timestamp;
        if (counter > 100) {
            paused = true;
        }
    }
}
