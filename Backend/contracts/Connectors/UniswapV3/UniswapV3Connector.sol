// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../OTCCustody/OTCCustody.sol";
import "../../interfaces/IUniswapV3Router.sol";
import "../../interfaces/IUniswapV3ConnectorFactory.sol";

contract UniswapV3Connector {
    using SafeERC20 for IERC20;

    OTCCustody public immutable otcCustody;
    IUniswapV3Router public immutable router;
    IUniswapV3ConnectorFactory public factory;
    bytes32 public custodyId;

    // Add mapping for authorized callers
    mapping(address => bool) public whitelistedCallers;

    modifier onlyOTCCustody() {
        require(msg.sender == address(otcCustody), "Only otcCustody can call");
        _;
    }

    modifier onlySelfOrotcCustody() {
        require(
            msg.sender == address(this) || msg.sender == address(otcCustody),
            "CCIPConnector: Caller is not self or OTCCustody"
        );
        _;
    }

    modifier onlyWhitelistedCaller() {
        require(
            whitelistedCallers[msg.sender],
            "CCIPConnector: Caller is not whitelisted"
        );
        _;
    }

    modifier allowedToken(address _token) {
        require(
            IUniswapV3ConnectorFactory(factory).tokenAllowed(_token),
            "Token not allowed"
        );
        _;
    }

    modifier allowedFee(uint24 _fee) {
        require(
            IUniswapV3ConnectorFactory(factory).feeAllowed(_fee),
            "Fee not allowed"
        );
        _;
    }

    constructor(
        address _otcCustodyAddress,
        address _routerAddress,
        address _factory,
        bytes32 _custodyId,
        address _whitelistedCaller
    ) {
        require(_otcCustodyAddress != address(0), "Invalid otcCustody address");
        require(_routerAddress != address(0), "Invalid router address");
        require(_factory != address(0), "Invalid factory address");

        otcCustody = OTCCustody(_otcCustodyAddress);
        router = IUniswapV3Router(_routerAddress);
        factory = IUniswapV3ConnectorFactory(_factory);
        custodyId = _custodyId;
        whitelistedCallers[_whitelistedCaller] = true;
    }

    // TEMPORARY: Only OTCCustody or whitelisted callers
    // WARNING: This is a temporary solution and should be removed after testing
    modifier onlyOTCCustodyOrWhitelistedCaller() {
        require(
            msg.sender == address(otcCustody) || whitelistedCallers[msg.sender],
            "CCIPConnector: Caller is not OTCCustody or whitelisted"
        );
        _;
    }

    // Swap exact tokens for tokens (minimumAmountOut is calculated from slippageLimitBps)
    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn
    )
        external
        allowedToken(tokenIn)
        allowedToken(tokenOut)
        allowedFee(fee)
        onlyOTCCustody
        returns (uint256 amountOut)
    {
        // Transfer tokens from OTCCustody to this contract
        // Note: This should be done through custodyToConnector in the OTCCustody contract before calling this

        // Calculate minimum output based on slippage limit

        // Approve router to spend tokens
        IERC20(tokenIn).approve(address(router), amountIn);

        // Set deadline
        uint256 deadline = block.timestamp + factory.maxDeadlineExtension();

        // Execute swap
        IUniswapV3Router.ExactInputSingleParams memory params = IUniswapV3Router
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: address(this),
                deadline: deadline,
                amountIn: amountIn,
                amountOutMinimum: 0, // Will be validated off-chain in the custody permission
                sqrtPriceLimitX96: 0 // No price limit
            });

        amountOut = router.exactInputSingle(params);

        // Return tokens to OTCCustody custody
        connectorToCustody(tokenOut, amountOut);

        return amountOut;
    }

    // Swap exact tokens for tokens with minimum output
    function swapExactInput(
        bytes calldata path,
        uint256 amountIn
    ) external onlyOTCCustody returns (uint256 amountOut) {
        // Get input token (first token in path)
        address tokenIn = extractTokenIn(path);
        require(
            IUniswapV3ConnectorFactory(factory).tokenAllowed(tokenIn),
            "Input token not allowed"
        );

        // Approve router to spend tokens
        IERC20(tokenIn).approve(address(router), amountIn);

        // Set deadline
        uint256 deadline = block.timestamp + factory.maxDeadlineExtension();

        // Execute swap
        IUniswapV3Router.ExactInputParams memory params = IUniswapV3Router
            .ExactInputParams({
                path: path,
                recipient: address(this),
                deadline: deadline,
                amountIn: amountIn,
                amountOutMinimum: 0 // Will be validated off-chain in the custody permission
            });

        amountOut = router.exactInput(params);

        // Extract output token (last token in path)
        address tokenOut = extractTokenOut(path);
        require(
            IUniswapV3ConnectorFactory(factory).tokenAllowed(tokenOut),
            "Output token not allowed"
        );

        // Return tokens to OTCCustody custody
        connectorToCustody(tokenOut, amountOut);

        return amountOut;
    }

    // Swap tokens for exact tokens
    function swapExactOutputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountOut,
        uint256 amountInMaximum
    )
        external
        allowedToken(tokenIn)
        allowedToken(tokenOut)
        allowedFee(fee)
        onlyOTCCustody
        returns (uint256 amountIn)
    {
        // Approve router to spend tokens
        IERC20(tokenIn).approve(address(router), amountInMaximum);

        // Set deadline
        uint256 deadline = block.timestamp + factory.maxDeadlineExtension();

        // Execute swap
        IUniswapV3Router.ExactOutputSingleParams memory params = IUniswapV3Router
            .ExactOutputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: address(this),
                deadline: deadline,
                amountOut: amountOut,
                amountInMaximum: amountInMaximum,
                sqrtPriceLimitX96: 0 // No price limit
            });

        amountIn = router.exactOutputSingle(params);

        // Return unused input tokens and output tokens to OTCCustody custody
        if (amountIn < amountInMaximum) {
            uint256 remainingInput = amountInMaximum - amountIn;
            connectorToCustody(tokenIn, remainingInput);
        }
        connectorToCustody(tokenOut, amountOut);

        return amountIn;
    }

    // Move tokens from Connector back to OTCCustody custody
    function connectorToCustody(
        address _token,
        uint256 _amount
    ) public onlyOTCCustody {
        IERC20(_token).approve(address(otcCustody), _amount);
        otcCustody.addressToCustody(custodyId, _token, _amount);
    }

    // Helper to extract input token from path
    function extractTokenIn(
        bytes calldata path
    ) internal pure returns (address) {
        require(path.length >= 20, "Invalid path");
        return address(uint160(bytes20(path[:20])));
    }

    // Helper to extract output token from path
    function extractTokenOut(
        bytes calldata path
    ) internal pure returns (address) {
        require(path.length >= 20, "Invalid path");
        return address(uint160(bytes20(path[path.length - 20:])));
    }
}
