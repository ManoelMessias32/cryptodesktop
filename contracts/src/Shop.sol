// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Gametoken.sol";

contract Shop is Ownable {
    GameToken public token;

    struct Item {
        uint256 id;
        string name;
        uint256 priceToken; // amount in token decimals
        uint256 priceBNBWei; // price in wei
    }

    mapping(uint256 => Item) public items;
    uint256 public nextItemId;

    mapping(address => uint256) public points; // simple points for ranks

    // referral basis points (bps). Example: 500 = 5%
    uint256 public referralBps;

    event ItemAdded(uint256 indexed id, string name, uint256 priceToken, uint256 priceBNBWei);
    event BoughtWithToken(address indexed buyer, uint256 indexed itemId, address indexed referrer);
    event BoughtWithBNB(address indexed buyer, uint256 indexed itemId, address indexed referrer, uint256 amount);

    constructor(address tokenAddr) {
        token = GameToken(tokenAddr);
        referralBps = 500; // 5% default
    }

    function addItem(string calldata name, uint256 priceToken, uint256 priceBNBWei) external onlyOwner {
        uint256 id = nextItemId++;
        items[id] = Item(id, name, priceToken, priceBNBWei);
        emit ItemAdded(id, name, priceToken, priceBNBWei);
    }

    function buyWithToken(uint256 itemId, address referrer) external {
        Item memory it = items[itemId];
        require(bytes(it.name).length != 0, "invalid item");

        // buyer must approve the Shop contract
        bool ok = token.transferFrom(msg.sender, address(this), it.priceToken);
        require(ok, "token transfer failed");

        _applyReferralToken(referrer, it.priceToken);
        points[msg.sender] += 10;
        emit BoughtWithToken(msg.sender, itemId, referrer);
    }

    function buyWithBNB(uint256 itemId, address referrer) external payable {
        Item memory it = items[itemId];
        require(bytes(it.name).length != 0, "invalid item");
        require(msg.value >= it.priceBNBWei, "not enough BNB");

        _applyReferralBNB(referrer, msg.value);
        points[msg.sender] += 20;
        emit BoughtWithBNB(msg.sender, itemId, referrer, msg.value);
    }

    function _applyReferralToken(address referrer, uint256 amount) internal {
        if (referrer == address(0) || referrer == msg.sender) return;
        uint256 bonus = (amount * referralBps) / 10000;
        if (bonus > 0) {
            // For demo we call mint to give referral bonus. In production, better transfer from a reserve.
            token.mint(referrer, bonus);
        }
    }

    function _applyReferralBNB(address referrer, uint256 amount) internal {
        if (referrer == address(0) || referrer == msg.sender) return;
        uint256 bonus = (amount * referralBps) / 10000;
        if (bonus > 0) {
            payable(referrer).transfer(bonus);
        }
    }

    // Owner helpers
    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        token.transfer(to, amount);
    }

    function withdrawBNB(address payable to, uint256 amount) external onlyOwner {
        to.transfer(amount);
    }

    function setReferralBps(uint256 _bps) external onlyOwner {
        referralBps = _bps;
    }
}
