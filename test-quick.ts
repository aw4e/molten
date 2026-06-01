import "dotenv/config";
import { auditContract } from "./src/core/auditor.js";
import { analyzeGas } from "./src/core/gas-analyzer.js";

const VULN_CONTRACT = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnBank {
  mapping(address => uint256) public balances;

  function deposit() external payable {
    balances[msg.sender] += msg.value;
  }

  // reentrancy vulnerability
  function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient");
    (bool ok,) = msg.sender.call{value: amount}("");
    require(ok, "Transfer failed");
    balances[msg.sender] -= amount;
  }

  // no access control
  function drain() external {
    payable(msg.sender).transfer(address(this).balance);
  }
}
`;

console.log("=== audit_contract ===");
const auditResult = await auditContract(VULN_CONTRACT);
console.log(JSON.stringify(auditResult, null, 2));

console.log("\n=== analyze_gas ===");
const gasResult = await analyzeGas(VULN_CONTRACT);
console.log(JSON.stringify(gasResult, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2));
