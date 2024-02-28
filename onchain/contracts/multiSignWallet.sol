//SPDX-Identify-License:MIT
pragma solidity ^0.8.0;

contract MultiSignWallet {
    /* event */
    event Deposit(address indexed sender, uint amount, uint balance);
    event submitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed to,
        uint value,
        bytes data
    );
    event confirmTransaction(address indexed owner, uint indexed txIndex);
    event executeTransaction(address indexed owner, uint indexed txIndex);

    /* state varies */
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public numConfirmationsRequired;

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
    }

    // mapping from tx index => owner => bool
    mapping(uint => mapping(address => bool)) public isConfirmed;

    Transaction[] public transactions;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner!");
        _;
    }

    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist!");
        _;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed!");
        _;
    }

    modifier notConfirmed(uint _txIndex) {
        require(
            !isConfirmed[_txIndex][msg.sender],
            "tx already confirmed!"
        );
        _;
    }

    constructor(address[] memory _owners, uint _numConfirmationsRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    receive() payable external {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // • 多签持有人可提交交易
    function SubmitTransaction(address _to, uint _value, bytes memory _data) public onlyOwner {
        uint txIndex = transactions.length;
        transactions.push(Transaction({to:_to,value:_value,data:_data,executed:false,numConfirmations:0}));
        emit submitTransaction(msg.sender,txIndex,_to,_value,_data);
    }
    
    // • 其他多签人确认交易(使用交易的方式确认即可)
    function ConfirmTransaction(uint _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage tempTransaction = transactions[_txIndex];
        require(tempTransaction.numConfirmations < numConfirmationsRequired, "tx already confirmed");
        tempTransaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit confirmTransaction(msg.sender, _txIndex);
    }

    // • 达到多签⻔槛、任何人都可以执行交易
    function ExecuteTransaction(uint _txIndex) public payable onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage tempTransaction = transactions[_txIndex];
        require(tempTransaction.numConfirmations >= numConfirmationsRequired, "cannot execute tx, not enough to confirm!");
        require(address(this).balance >= tempTransaction.value, "not enough ether");
        transactions[_txIndex].executed = true;
        (bool success,) = tempTransaction.to.call{value:tempTransaction.value}(tempTransaction.data);
        require(success, "tx failed");

        emit executeTransaction(msg.sender, _txIndex);
    }

    function getTransaction(uint _txIndex) public view returns(address to, uint value, bytes memory data, bool executed){
        Transaction storage tempTransaction = transactions[_txIndex];
        return(tempTransaction.to, tempTransaction.value, tempTransaction.data, tempTransaction.executed);
    }
}