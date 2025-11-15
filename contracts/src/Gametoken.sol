// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Token do jogo (demo). A função mint é pública aqui para facilitar testes locais.
/// Em produção restrinja a mint a um papel de confiança (owner ou backend verificado).
contract GameToken is ERC20, Ownable {
	constructor() ERC20("GameToken", "GT") {}

	/// @notice DEMO: permite cunhar tokens para qualquer endereço. Trocar por controle em produção.
	function mint(address to, uint256 amount) external {
		_mint(to, amount);
	}
}

