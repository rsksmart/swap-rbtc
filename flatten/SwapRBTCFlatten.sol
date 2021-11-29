// Sources flattened with hardhat v2.6.8 https://hardhat.org

// File contracts/ISideToken.sol

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP. Does not include
 * the optional functions; to access them see {ERC20Detailed}.
 */
interface ISideToken {
  /**
    * @dev Returns the name of the token.
  */
  function name() external view returns (string memory);

  /**
    * @dev Returns the symbol of the token, usually a shorter version of the
    * name.
  */
  function symbol() external view returns (string memory);

  /**
    * @dev Returns the smallest part of the token that is not divisible. This
    * means all token operations (creation, movement and destruction) must have
    * amounts that are a multiple of this number.
    *
    * For most token contracts, this value will equal 1.
  */
  function granularity() external view returns (uint256);

  /**
    * @dev Returns the amount of tokens in existence.
    */
  function totalSupply() external view returns (uint256);

  /**
    * @dev Returns the amount of tokens owned by an account (`owner`).
    */
  function balanceOf(address owner) external view returns (uint256);

  /**
    * @dev Moves `amount` tokens from the caller's account to `recipient`.
    *
    * If send or receive hooks are registered for the caller and `recipient`,
    * the corresponding functions will be called with `data` and empty
    * `operatorData`. See `IERC777Sender` and `IERC777Recipient`.
    *
    * Emits a `Sent` event.
    *
    * Requirements
    *
    * - the caller must have at least `amount` tokens.
    * - `recipient` cannot be the zero address.
    * - if `recipient` is a contract, it must implement the `tokensReceived`
    * interface.
    */
  function send(address recipient, uint256 amount, bytes calldata data) external;

  /**
    * @dev Destroys `amount` tokens from the caller's account, reducing the
    * total supply.
    *
    * If a send hook is registered for the caller, the corresponding function
    * will be called with `data` and empty `operatorData`. See `IERC777Sender`.
    *
    * Emits a `Burned` event.
    *
    * Requirements
    *
    * - the caller must have at least `amount` tokens.
  */
  function burn(uint256 amount, bytes calldata data) external;

  /**
    * @dev Returns true if an account is an operator of `tokenHolder`.
    * Operators can send and burn tokens on behalf of their owners. All
    * accounts are their own operator.
    *
    * See `operatorSend` and `operatorBurn`.
  */
  function isOperatorFor(address operator, address tokenHolder) external view returns (bool);

  /**
    * @dev Make an account an operator of the caller.
    *
    * See `isOperatorFor`.
    *
    * Emits an `AuthorizedOperator` event.
    *
    * Requirements
    *
    * - `operator` cannot be calling address.
  */
  function authorizeOperator(address operator) external;

  /**
    * @dev Make an account an operator of the caller.
    *
    * See `isOperatorFor` and `defaultOperators`.
    *
    * Emits a `RevokedOperator` event.
    *
    * Requirements
    *
    * - `operator` cannot be calling address.
  */
  function revokeOperator(address operator) external;

  /**
    * @dev Returns the list of default operators. These accounts are operators
    * for all token holders, even if `authorizeOperator` was never called on
    * them.
    *
    * This list is immutable, but individual holders may revoke these via
    * `revokeOperator`, in which case `isOperatorFor` will return false.
  */
  function defaultOperators() external view returns (address[] memory);

  /**
    * @dev Moves `amount` tokens from `sender` to `recipient`. The caller must
    * be an operator of `sender`.
    *
    * If send or receive hooks are registered for `sender` and `recipient`,
    * the corresponding functions will be called with `data` and
    * `operatorData`. See `IERC777Sender` and `IERC777Recipient`.
    *
    * Emits a `Sent` event.
    *
    * Requirements
    *
    * - `sender` cannot be the zero address.
    * - `sender` must have at least `amount` tokens.
    * - the caller must be an operator for `sender`.
    * - `recipient` cannot be the zero address.
    * - if `recipient` is a contract, it must implement the `tokensReceived`
    * interface.
  */
  function operatorSend(
    address sender,
    address recipient,
    uint256 amount,
    bytes calldata data,
    bytes calldata operatorData
  ) external;

  /**
    * @dev Destoys `amount` tokens from `account`, reducing the total supply.
    * The caller must be an operator of `account`.
    *
    * If a send hook is registered for `account`, the corresponding function
    * will be called with `data` and `operatorData`. See `IERC777Sender`.
    *
    * Emits a `Burned` event.
    *
    * Requirements
    *
    * - `account` cannot be the zero address.
    * - `account` must have at least `amount` tokens.
    * - the caller must be an operator for `account`.
  */
  function operatorBurn(
    address account,
    uint256 amount,
    bytes calldata data,
    bytes calldata operatorData
  ) external;

  event Sent(
    address indexed operator,
    address indexed from,
    address indexed to,
    uint256 amount,
    bytes data,
    bytes operatorData
  );

  function decimals() external returns (uint8);

  event Minted(address indexed operator, address indexed to, uint256 amount, bytes data, bytes operatorData);

  event Burned(address indexed operator, address indexed from, uint256 amount, bytes data, bytes operatorData);

  event AuthorizedOperator(address indexed operator, address indexed tokenHolder);

  event RevokedOperator(address indexed operator, address indexed tokenHolder);

  // ERC20 METHODS

  /**
    * @dev Moves `amount` tokens from `sender` to `recipient` using the
    * allowance mechanism. `amount` is then deducted from the caller's
    * allowance.
    *
    * Returns a boolean value indicating whether the operation succeeded.
    *
    * Emits a {Transfer} event.
  */
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

  // ISideToken METHODS

  function mint(address account, uint256 amount, bytes calldata userData, bytes calldata operatorData) external;
}


// File contracts/ISwapRBTC.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISwapRBTC {

  function swapWRBTCtoRBTC(uint256 amount) external returns (uint256);

}


// File @openzeppelin/contracts/utils/introspection/IERC1820Registry.sol@v4.3.3

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the global ERC1820 Registry, as defined in the
 * https://eips.ethereum.org/EIPS/eip-1820[EIP]. Accounts may register
 * implementers for interfaces in this registry, as well as query support.
 *
 * Implementers may be shared by multiple accounts, and can also implement more
 * than a single interface for each account. Contracts can implement interfaces
 * for themselves, but externally-owned accounts (EOA) must delegate this to a
 * contract.
 *
 * {IERC165} interfaces can also be queried via the registry.
 *
 * For an in-depth explanation and source code analysis, see the EIP text.
 */
interface IERC1820Registry {
    /**
     * @dev Sets `newManager` as the manager for `account`. A manager of an
     * account is able to set interface implementers for it.
     *
     * By default, each account is its own manager. Passing a value of `0x0` in
     * `newManager` will reset the manager to this initial state.
     *
     * Emits a {ManagerChanged} event.
     *
     * Requirements:
     *
     * - the caller must be the current manager for `account`.
     */
    function setManager(address account, address newManager) external;

    /**
     * @dev Returns the manager for `account`.
     *
     * See {setManager}.
     */
    function getManager(address account) external view returns (address);

    /**
     * @dev Sets the `implementer` contract as ``account``'s implementer for
     * `interfaceHash`.
     *
     * `account` being the zero address is an alias for the caller's address.
     * The zero address can also be used in `implementer` to remove an old one.
     *
     * See {interfaceHash} to learn how these are created.
     *
     * Emits an {InterfaceImplementerSet} event.
     *
     * Requirements:
     *
     * - the caller must be the current manager for `account`.
     * - `interfaceHash` must not be an {IERC165} interface id (i.e. it must not
     * end in 28 zeroes).
     * - `implementer` must implement {IERC1820Implementer} and return true when
     * queried for support, unless `implementer` is the caller. See
     * {IERC1820Implementer-canImplementInterfaceForAddress}.
     */
    function setInterfaceImplementer(
        address account,
        bytes32 _interfaceHash,
        address implementer
    ) external;

    /**
     * @dev Returns the implementer of `interfaceHash` for `account`. If no such
     * implementer is registered, returns the zero address.
     *
     * If `interfaceHash` is an {IERC165} interface id (i.e. it ends with 28
     * zeroes), `account` will be queried for support of it.
     *
     * `account` being the zero address is an alias for the caller's address.
     */
    function getInterfaceImplementer(address account, bytes32 _interfaceHash) external view returns (address);

    /**
     * @dev Returns the interface hash for an `interfaceName`, as defined in the
     * corresponding
     * https://eips.ethereum.org/EIPS/eip-1820#interface-name[section of the EIP].
     */
    function interfaceHash(string calldata interfaceName) external pure returns (bytes32);

    /**
     * @notice Updates the cache with whether the contract implements an ERC165 interface or not.
     * @param account Address of the contract for which to update the cache.
     * @param interfaceId ERC165 interface for which to update the cache.
     */
    function updateERC165Cache(address account, bytes4 interfaceId) external;

    /**
     * @notice Checks whether a contract implements an ERC165 interface or not.
     * If the result is not cached a direct lookup on the contract address is performed.
     * If the result is not cached or the cached value is out-of-date, the cache MUST be updated manually by calling
     * {updateERC165Cache} with the contract address.
     * @param account Address of the contract to check.
     * @param interfaceId ERC165 interface to check.
     * @return True if `account` implements `interfaceId`, false otherwise.
     */
    function implementsERC165Interface(address account, bytes4 interfaceId) external view returns (bool);

    /**
     * @notice Checks whether a contract implements an ERC165 interface or not without using nor updating the cache.
     * @param account Address of the contract to check.
     * @param interfaceId ERC165 interface to check.
     * @return True if `account` implements `interfaceId`, false otherwise.
     */
    function implementsERC165InterfaceNoCache(address account, bytes4 interfaceId) external view returns (bool);

    event InterfaceImplementerSet(address indexed account, bytes32 indexed interfaceHash, address indexed implementer);

    event ManagerChanged(address indexed account, address indexed newManager);
}


// File @openzeppelin/contracts/token/ERC777/IERC777Recipient.sol@v4.3.3

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC777TokensRecipient standard as defined in the EIP.
 *
 * Accounts can be notified of {IERC777} tokens being sent to them by having a
 * contract implement this interface (contract holders can be their own
 * implementer) and registering it on the
 * https://eips.ethereum.org/EIPS/eip-1820[ERC1820 global registry].
 *
 * See {IERC1820Registry} and {ERC1820Implementer}.
 */
interface IERC777Recipient {
    /**
     * @dev Called by an {IERC777} token contract whenever tokens are being
     * moved or created into a registered account (`to`). The type of operation
     * is conveyed by `from` being the zero address or not.
     *
     * This call occurs _after_ the token contract's state is updated, so
     * {IERC777-balanceOf}, etc., can be used to query the post-operation state.
     *
     * This function may revert to prevent the operation from being executed.
     */
    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external;
}


// File @openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol@v4.3.3

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since a proxied contract can't have a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 *
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {ERC1967Proxy-constructor}.
 *
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 */
abstract contract Initializable {
    /**
     * @dev Indicates that the contract has been initialized.
     */
    bool private _initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private _initializing;

    /**
     * @dev Modifier to protect an initializer function from being invoked twice.
     */
    modifier initializer() {
        require(_initializing || !_initialized, "Initializable: contract is already initialized");

        bool isTopLevelCall = !_initializing;
        if (isTopLevelCall) {
            _initializing = true;
            _initialized = true;
        }

        _;

        if (isTopLevelCall) {
            _initializing = false;
        }
    }
}


// File @openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol@v4.3.3

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract ContextUpgradeable is Initializable {
    function __Context_init() internal initializer {
        __Context_init_unchained();
    }

    function __Context_init_unchained() internal initializer {
    }
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
    uint256[50] private __gap;
}


// File @openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol@v4.3.3

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract OwnableUpgradeable is Initializable, ContextUpgradeable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    function __Ownable_init() internal initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
    }

    function __Ownable_init_unchained() internal initializer {
        _setOwner(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _setOwner(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _setOwner(newOwner);
    }

    function _setOwner(address newOwner) private {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    uint256[49] private __gap;
}


// File contracts/SwapRBTC.sol

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;






contract SwapRBTC is Initializable, OwnableUpgradeable, ISwapRBTC, IERC777Recipient {
  event WrappedBtcChanged(address sideTokenBtc);
  event RbtcSwapRbtc(address sideTokenBtc, uint256 amountSwapped);
  event Withdrawal(address indexed src, uint256 wad, address sideTokenBtc);
  event Received(address sender, uint256 amount);
  event TokenReceived(
    address operator,
    address from,
    address to,
    uint256 amount,
    bytes userData,
    bytes operatorData
  );

  IERC1820Registry constant internal ERC1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
  ISideToken public sideTokenBtc; // sideEthereumBTC
  address internal constant NULL_ADDRESS = address(0);

  function initialize(address sideTokenBtcContract) public initializer {
    _setSideTokenBtc(sideTokenBtcContract);
    // keccak256("ERC777TokensRecipient")
    ERC1820.setInterfaceImplementer(address(this), 0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b, address(this));
  }

  receive () external payable {
		// The fallback function is needed to use WRBTC
		// require(_msgSender() == address(sideTokenBtc), "SwapRBTC: not sideBTC address");
    emit Received(msg.sender, msg.value);
	}

  function _setSideTokenBtc(address sideTokenBtcContract) internal {
    require(sideTokenBtcContract != NULL_ADDRESS, "SwapRBTC: sideBTC is null");
    sideTokenBtc = ISideToken(sideTokenBtcContract);
    emit WrappedBtcChanged(sideTokenBtcContract);
  }

  function setWrappedBtc(address sideTokenBtcContract) public onlyOwner {
    _setSideTokenBtc(sideTokenBtcContract);
  }

  function swapWRBTCtoRBTC(uint256 amount) external override returns (uint256) {
    address payable sender = payable(msg.sender);
    require(sideTokenBtc.balanceOf(sender) >= amount, "SwapRBTC: not enough balance");

    bool successTransfer = sideTokenBtc.transferFrom(sender, address(this), amount);
    emit Withdrawal(sender, amount, address(sideTokenBtc));

    require(successTransfer, "SwapRBTC: Transfer sender failed");
    require(address(this).balance >= amount, "SwapRBTC: amount > balance");

    sideTokenBtc.burn(amount, "");

    // solhint-disable-next-line avoid-low-level-calls
    (bool successCall,) = sender.call{value: amount}("");
    require(successCall, "SwapRBTC: Swap call failed");
    emit RbtcSwapRbtc(address(sideTokenBtc), amount);

    return amount;
  }

  /**
    * @dev Called by an `IERC777` token contract whenever tokens are being
    * moved or created into a registered account (`to`). The type of operation
    * is conveyed by `from` being the zero address or not.
    *
    * This call occurs _after_ the token contract's state is updated, so
    * `IERC777.balanceOf`, etc., can be used to query the post-operation state.
    *
    * This function may revert to prevent the operation from being executed.
  */
  function tokensReceived(
    address operator,
    address from,
    address to,
    uint amount,
    bytes calldata userData,
    bytes calldata operatorData
  ) external override {
    emit TokenReceived(operator, from, to, amount, userData, operatorData);
  }

}
