pragma solidity ^0.8.0;

contract DividendToken {
    event Transfer(address from, address to, uint256 value);
    event Approval(address owner, address spender, uint256 value);

    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint256 totalDividendPoints = 0;

    struct accountInfo {
        uint256 balance;
        uint256 lastDividentsValue;
    }
    mapping(address => accountInfo) private _balances;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        _mint(msg.sender, 10000);
    }

    fallback() external payable {
        totalDividendPoints += msg.value;
    }

    function _payDividend(address investor_) internal {
        uint256 dividendValue = totalDividendPoints - lastDividendOf(investor_);
        uint256 debt = (_balances[investor_].balance * dividendValue) /
            _totalSupply;
        if (debt > 0) {
            _balances[investor_].lastDividentsValue = totalDividendPoints;
            (bool sent, ) = investor_.call{value: debt}("");
            require(sent, "Failed to send Ether");
        }
    }

    function getTotalDividents() external view returns (uint256) {
        return totalDividendPoints;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 0;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account].balance;
    }

    function lastDividendOf(address account) public view returns (uint256) {
        return _balances[account].lastDividentsValue;
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        _approve(sender, msg.sender, currentAllowance - amount);

        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        returns (bool)
    {
        _approve(
            msg.sender,
            spender,
            _allowances[msg.sender][spender] + addedValue
        );
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        returns (bool)
    {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        require(
            currentAllowance >= subtractedValue,
            "ERC20: decreased allowance below zero"
        );
        _approve(msg.sender, spender, currentAllowance - subtractedValue);

        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(sender, recipient, amount);

        uint256 senderBalance = _balances[sender].balance;
        require(
            senderBalance >= amount,
            "ERC20: transfer amount exceeds balance"
        );

        _balances[sender].balance = senderBalance - amount;
        _balances[recipient].balance += amount;

        emit Transfer(sender, recipient, amount);

        _afterTokenTransfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply += amount;
        _balances[account].balance += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {}

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal {
        _payDividend(from);
        _payDividend(to);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal {}
}
