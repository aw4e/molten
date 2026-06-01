// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice On-chain registry for the Molten MCP server.
/// Stores project metadata and tracks tool usage counts.
contract MoltenRegistry {
    string public constant NAME = "molten";
    string public constant VERSION = "0.2.0";
    string public constant DESCRIPTION = "AI-powered MCP server for Mantle Network developers";

    address public immutable deployer;
    uint256 public immutable deployedAt;

    // tool name => call count
    mapping(string => uint256) public toolCallCount;
    uint256 public totalCalls;

    event ToolUsed(string indexed tool, address indexed caller);

    constructor() {
        deployer = msg.sender;
        deployedAt = block.timestamp;
    }

    /// @notice Record an off-chain tool call on-chain (optional — for demo/analytics).
    function recordToolCall(string calldata tool) external {
        toolCallCount[tool] += 1;
        totalCalls += 1;
        emit ToolUsed(tool, msg.sender);
    }

    /// @notice Returns project identity as a tuple.
    function identity() external pure returns (string memory, string memory, string memory) {
        return (NAME, VERSION, DESCRIPTION);
    }
}
