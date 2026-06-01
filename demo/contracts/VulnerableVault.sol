// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Demo contract with intentional vulnerabilities for testing audit_contract tool
contract VulnerableVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // VULNERABILITY: reentrancy — state updated after external call
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        balances[msg.sender] -= amount;
    }

    // VULNERABILITY: tx.origin authentication
    function adminWithdraw(uint256 amount) external {
        require(tx.origin == owner, "Not owner");
        payable(owner).transfer(amount);
    }

    // GAS ISSUE: reading storage in loop
    function totalBalances(address[] calldata users) external view returns (uint256 total) {
        for (uint256 i = 0; i < users.length; i++) {
            total += balances[users[i]];
        }
    }
}
