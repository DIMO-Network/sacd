// Code generated via abigen V2 - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package sacd

import (
	"bytes"
	"errors"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind/v2"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = bytes.Equal
	_ = errors.New
	_ = big.NewInt
	_ = common.Big1
	_ = types.BloomLookup
	_ = abi.ConvertType
)

// ISacdPaymentRecord is an auto generated low-level Go binding around an user-defined struct.
type ISacdPaymentRecord struct {
	Amount     *big.Int
	Expiration uint64
	Currency   [3]byte
	Source     string
}

// ISacdPermissionRecord is an auto generated low-level Go binding around an user-defined struct.
type ISacdPermissionRecord struct {
	Permissions *big.Int
	Expiration  *big.Int
	Source      string
	TemplateId  *big.Int
}

// SacdMetaData contains all meta data concerning the Sacd contract.
var SacdMetaData = bind.MetaData{
	ABI: "[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AccessControlBadConfirmation\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"neededRole\",\"type\":\"bytes32\"}],\"name\":\"AccessControlUnauthorizedAccount\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"target\",\"type\":\"address\"}],\"name\":\"AddressEmptyCode\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"implementation\",\"type\":\"address\"}],\"name\":\"ERC1967InvalidImplementation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ERC1967NonPayable\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"FailedInnerCall\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidCurrency\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidInitialization\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"InvalidTokenId\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotInitializing\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"expectedAsset\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"providedAsset\",\"type\":\"address\"}],\"name\":\"TemplateAssetMismatch\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"TemplateContractNotSet\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"TemplateNotActive\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"expectedPermissions\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"providedPermissions\",\"type\":\"uint256\"}],\"name\":\"TemplatePermissionsMismatch\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UUPSUnauthorizedCallContext\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"slot\",\"type\":\"bytes32\"}],\"name\":\"UUPSUnsupportedProxiableUUID\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"Unauthorized\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ZeroAddress\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint64\",\"name\":\"version\",\"type\":\"uint64\"}],\"name\":\"Initialized\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"grantor\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"expiration\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"}],\"name\":\"PaymentSet\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"expiration\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"}],\"name\":\"PermissionsSet\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"previousAdminRole\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"newAdminRole\",\"type\":\"bytes32\"}],\"name\":\"RoleAdminChanged\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"RoleGranted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"RoleRevoked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"implementation\",\"type\":\"address\"}],\"name\":\"Upgraded\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"DEFAULT_ADMIN_ROLE\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"UPGRADE_INTERFACE_VERSION\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"grantor\",\"type\":\"address\"}],\"name\":\"currentPaymentRecord\",\"outputs\":[{\"components\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"uint64\",\"name\":\"expiration\",\"type\":\"uint64\"},{\"internalType\":\"bytes3\",\"name\":\"currency\",\"type\":\"bytes3\"},{\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"}],\"internalType\":\"structISacd.PaymentRecord\",\"name\":\"paymentRecord\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"}],\"name\":\"currentPermissionRecord\",\"outputs\":[{\"components\":[{\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"expiration\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"internalType\":\"structISacd.PermissionRecord\",\"name\":\"permissionRecord\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"}],\"name\":\"getPermissions\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"}],\"name\":\"getRoleAdmin\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"grantRole\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"},{\"internalType\":\"uint8\",\"name\":\"permissionIndex\",\"type\":\"uint8\"}],\"name\":\"hasPermission\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"}],\"name\":\"hasPermissions\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"hasRole\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"templateContractAddress\",\"type\":\"address\"}],\"name\":\"initialize\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"grantor\",\"type\":\"address\"}],\"name\":\"nextPaymentId\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"paymentId\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"onTransfer\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"grantor\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"paymentId\",\"type\":\"uint256\"}],\"name\":\"paymentRecords\",\"outputs\":[{\"components\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"uint64\",\"name\":\"expiration\",\"type\":\"uint64\"},{\"internalType\":\"bytes3\",\"name\":\"currency\",\"type\":\"bytes3\"},{\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"}],\"internalType\":\"structISacd.PaymentRecord\",\"name\":\"paymentRecord\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"version\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"}],\"name\":\"permissionRecords\",\"outputs\":[{\"components\":[{\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"expiration\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"internalType\":\"structISacd.PermissionRecord\",\"name\":\"permissionRecord\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"proxiableUUID\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"callerConfirmation\",\"type\":\"address\"}],\"name\":\"renounceRole\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"revokeRole\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"grantor\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"uint64\",\"name\":\"expiration\",\"type\":\"uint64\"},{\"internalType\":\"bytes3\",\"name\":\"currency\",\"type\":\"bytes3\"},{\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"}],\"name\":\"setPayment\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"expiration\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"}],\"name\":\"setPermissions\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"grantee\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"expiration\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"}],\"name\":\"setPermissions\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"templateContractAddress\",\"type\":\"address\"}],\"name\":\"setTemplateContract\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"templateContract\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"template_\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"tokenIdToVersion\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"version\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newImplementation\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"upgradeToAndCall\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"}]",
	ID:  "Sacd",
}

// Sacd is an auto generated Go binding around an Ethereum contract.
type Sacd struct {
	abi abi.ABI
}

// NewSacd creates a new instance of Sacd.
func NewSacd() *Sacd {
	parsed, err := SacdMetaData.ParseABI()
	if err != nil {
		panic(errors.New("invalid ABI: " + err.Error()))
	}
	return &Sacd{abi: *parsed}
}

// Instance creates a wrapper for a deployed contract instance at the given address.
// Use this to create the instance object passed to abigen v2 library functions Call, Transact, etc.
func (c *Sacd) Instance(backend bind.ContractBackend, addr common.Address) *bind.BoundContract {
	return bind.NewBoundContract(addr, c.abi, backend, backend, backend)
}

// PackDEFAULTADMINROLE is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xa217fddf.
//
// Solidity: function DEFAULT_ADMIN_ROLE() view returns(bytes32)
func (sacd *Sacd) PackDEFAULTADMINROLE() []byte {
	enc, err := sacd.abi.Pack("DEFAULT_ADMIN_ROLE")
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackDEFAULTADMINROLE is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0xa217fddf.
//
// Solidity: function DEFAULT_ADMIN_ROLE() view returns(bytes32)
func (sacd *Sacd) UnpackDEFAULTADMINROLE(data []byte) ([32]byte, error) {
	out, err := sacd.abi.Unpack("DEFAULT_ADMIN_ROLE", data)
	if err != nil {
		return *new([32]byte), err
	}
	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)
	return out0, err
}

// PackUPGRADEINTERFACEVERSION is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xad3cb1cc.
//
// Solidity: function UPGRADE_INTERFACE_VERSION() view returns(string)
func (sacd *Sacd) PackUPGRADEINTERFACEVERSION() []byte {
	enc, err := sacd.abi.Pack("UPGRADE_INTERFACE_VERSION")
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackUPGRADEINTERFACEVERSION is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0xad3cb1cc.
//
// Solidity: function UPGRADE_INTERFACE_VERSION() view returns(string)
func (sacd *Sacd) UnpackUPGRADEINTERFACEVERSION(data []byte) (string, error) {
	out, err := sacd.abi.Unpack("UPGRADE_INTERFACE_VERSION", data)
	if err != nil {
		return *new(string), err
	}
	out0 := *abi.ConvertType(out[0], new(string)).(*string)
	return out0, err
}

// PackCurrentPaymentRecord is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x0f7d31f6.
//
// Solidity: function currentPaymentRecord(address asset, address grantee, address grantor) view returns((uint256,uint64,bytes3,string) paymentRecord)
func (sacd *Sacd) PackCurrentPaymentRecord(asset common.Address, grantee common.Address, grantor common.Address) []byte {
	enc, err := sacd.abi.Pack("currentPaymentRecord", asset, grantee, grantor)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackCurrentPaymentRecord is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x0f7d31f6.
//
// Solidity: function currentPaymentRecord(address asset, address grantee, address grantor) view returns((uint256,uint64,bytes3,string) paymentRecord)
func (sacd *Sacd) UnpackCurrentPaymentRecord(data []byte) (ISacdPaymentRecord, error) {
	out, err := sacd.abi.Unpack("currentPaymentRecord", data)
	if err != nil {
		return *new(ISacdPaymentRecord), err
	}
	out0 := *abi.ConvertType(out[0], new(ISacdPaymentRecord)).(*ISacdPaymentRecord)
	return out0, err
}

// PackCurrentPermissionRecord is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x426d9e4a.
//
// Solidity: function currentPermissionRecord(address asset, uint256 tokenId, address grantee) view returns((uint256,uint256,string,uint256) permissionRecord)
func (sacd *Sacd) PackCurrentPermissionRecord(asset common.Address, tokenId *big.Int, grantee common.Address) []byte {
	enc, err := sacd.abi.Pack("currentPermissionRecord", asset, tokenId, grantee)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackCurrentPermissionRecord is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x426d9e4a.
//
// Solidity: function currentPermissionRecord(address asset, uint256 tokenId, address grantee) view returns((uint256,uint256,string,uint256) permissionRecord)
func (sacd *Sacd) UnpackCurrentPermissionRecord(data []byte) (ISacdPermissionRecord, error) {
	out, err := sacd.abi.Unpack("currentPermissionRecord", data)
	if err != nil {
		return *new(ISacdPermissionRecord), err
	}
	out0 := *abi.ConvertType(out[0], new(ISacdPermissionRecord)).(*ISacdPermissionRecord)
	return out0, err
}

// PackGetPermissions is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x68233c61.
//
// Solidity: function getPermissions(address asset, uint256 tokenId, address grantee, uint256 permissions) view returns(uint256)
func (sacd *Sacd) PackGetPermissions(asset common.Address, tokenId *big.Int, grantee common.Address, permissions *big.Int) []byte {
	enc, err := sacd.abi.Pack("getPermissions", asset, tokenId, grantee, permissions)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackGetPermissions is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x68233c61.
//
// Solidity: function getPermissions(address asset, uint256 tokenId, address grantee, uint256 permissions) view returns(uint256)
func (sacd *Sacd) UnpackGetPermissions(data []byte) (*big.Int, error) {
	out, err := sacd.abi.Unpack("getPermissions", data)
	if err != nil {
		return new(big.Int), err
	}
	out0 := abi.ConvertType(out[0], new(big.Int)).(*big.Int)
	return out0, err
}

// PackGetRoleAdmin is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x248a9ca3.
//
// Solidity: function getRoleAdmin(bytes32 role) view returns(bytes32)
func (sacd *Sacd) PackGetRoleAdmin(role [32]byte) []byte {
	enc, err := sacd.abi.Pack("getRoleAdmin", role)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackGetRoleAdmin is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x248a9ca3.
//
// Solidity: function getRoleAdmin(bytes32 role) view returns(bytes32)
func (sacd *Sacd) UnpackGetRoleAdmin(data []byte) ([32]byte, error) {
	out, err := sacd.abi.Unpack("getRoleAdmin", data)
	if err != nil {
		return *new([32]byte), err
	}
	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)
	return out0, err
}

// PackGrantRole is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x2f2ff15d.
//
// Solidity: function grantRole(bytes32 role, address account) returns()
func (sacd *Sacd) PackGrantRole(role [32]byte, account common.Address) []byte {
	enc, err := sacd.abi.Pack("grantRole", role, account)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackHasPermission is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x48eb48f5.
//
// Solidity: function hasPermission(address asset, uint256 tokenId, address grantee, uint8 permissionIndex) view returns(bool)
func (sacd *Sacd) PackHasPermission(asset common.Address, tokenId *big.Int, grantee common.Address, permissionIndex uint8) []byte {
	enc, err := sacd.abi.Pack("hasPermission", asset, tokenId, grantee, permissionIndex)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackHasPermission is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x48eb48f5.
//
// Solidity: function hasPermission(address asset, uint256 tokenId, address grantee, uint8 permissionIndex) view returns(bool)
func (sacd *Sacd) UnpackHasPermission(data []byte) (bool, error) {
	out, err := sacd.abi.Unpack("hasPermission", data)
	if err != nil {
		return *new(bool), err
	}
	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)
	return out0, err
}

// PackHasPermissions is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x16bc016c.
//
// Solidity: function hasPermissions(address asset, uint256 tokenId, address grantee, uint256 permissions) view returns(bool)
func (sacd *Sacd) PackHasPermissions(asset common.Address, tokenId *big.Int, grantee common.Address, permissions *big.Int) []byte {
	enc, err := sacd.abi.Pack("hasPermissions", asset, tokenId, grantee, permissions)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackHasPermissions is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x16bc016c.
//
// Solidity: function hasPermissions(address asset, uint256 tokenId, address grantee, uint256 permissions) view returns(bool)
func (sacd *Sacd) UnpackHasPermissions(data []byte) (bool, error) {
	out, err := sacd.abi.Unpack("hasPermissions", data)
	if err != nil {
		return *new(bool), err
	}
	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)
	return out0, err
}

// PackHasRole is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x91d14854.
//
// Solidity: function hasRole(bytes32 role, address account) view returns(bool)
func (sacd *Sacd) PackHasRole(role [32]byte, account common.Address) []byte {
	enc, err := sacd.abi.Pack("hasRole", role, account)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackHasRole is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x91d14854.
//
// Solidity: function hasRole(bytes32 role, address account) view returns(bool)
func (sacd *Sacd) UnpackHasRole(data []byte) (bool, error) {
	out, err := sacd.abi.Unpack("hasRole", data)
	if err != nil {
		return *new(bool), err
	}
	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)
	return out0, err
}

// PackInitialize is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xc4d66de8.
//
// Solidity: function initialize(address templateContractAddress) returns()
func (sacd *Sacd) PackInitialize(templateContractAddress common.Address) []byte {
	enc, err := sacd.abi.Pack("initialize", templateContractAddress)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackNextPaymentId is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x8f4390ac.
//
// Solidity: function nextPaymentId(address asset, address grantee, address grantor) view returns(uint256 paymentId)
func (sacd *Sacd) PackNextPaymentId(asset common.Address, grantee common.Address, grantor common.Address) []byte {
	enc, err := sacd.abi.Pack("nextPaymentId", asset, grantee, grantor)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackNextPaymentId is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x8f4390ac.
//
// Solidity: function nextPaymentId(address asset, address grantee, address grantor) view returns(uint256 paymentId)
func (sacd *Sacd) UnpackNextPaymentId(data []byte) (*big.Int, error) {
	out, err := sacd.abi.Unpack("nextPaymentId", data)
	if err != nil {
		return new(big.Int), err
	}
	out0 := abi.ConvertType(out[0], new(big.Int)).(*big.Int)
	return out0, err
}

// PackOnTransfer is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xe81e9b64.
//
// Solidity: function onTransfer(address asset, uint256 tokenId) returns()
func (sacd *Sacd) PackOnTransfer(asset common.Address, tokenId *big.Int) []byte {
	enc, err := sacd.abi.Pack("onTransfer", asset, tokenId)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackPaymentRecords is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x51f88a65.
//
// Solidity: function paymentRecords(address asset, address grantee, address grantor, uint256 paymentId) view returns((uint256,uint64,bytes3,string) paymentRecord)
func (sacd *Sacd) PackPaymentRecords(asset common.Address, grantee common.Address, grantor common.Address, paymentId *big.Int) []byte {
	enc, err := sacd.abi.Pack("paymentRecords", asset, grantee, grantor, paymentId)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackPaymentRecords is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x51f88a65.
//
// Solidity: function paymentRecords(address asset, address grantee, address grantor, uint256 paymentId) view returns((uint256,uint64,bytes3,string) paymentRecord)
func (sacd *Sacd) UnpackPaymentRecords(data []byte) (ISacdPaymentRecord, error) {
	out, err := sacd.abi.Unpack("paymentRecords", data)
	if err != nil {
		return *new(ISacdPaymentRecord), err
	}
	out0 := *abi.ConvertType(out[0], new(ISacdPaymentRecord)).(*ISacdPaymentRecord)
	return out0, err
}

// PackPermissionRecords is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x15e7d96b.
//
// Solidity: function permissionRecords(address asset, uint256 tokenId, uint256 version, address grantee) view returns((uint256,uint256,string,uint256) permissionRecord)
func (sacd *Sacd) PackPermissionRecords(asset common.Address, tokenId *big.Int, version *big.Int, grantee common.Address) []byte {
	enc, err := sacd.abi.Pack("permissionRecords", asset, tokenId, version, grantee)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackPermissionRecords is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x15e7d96b.
//
// Solidity: function permissionRecords(address asset, uint256 tokenId, uint256 version, address grantee) view returns((uint256,uint256,string,uint256) permissionRecord)
func (sacd *Sacd) UnpackPermissionRecords(data []byte) (ISacdPermissionRecord, error) {
	out, err := sacd.abi.Unpack("permissionRecords", data)
	if err != nil {
		return *new(ISacdPermissionRecord), err
	}
	out0 := *abi.ConvertType(out[0], new(ISacdPermissionRecord)).(*ISacdPermissionRecord)
	return out0, err
}

// PackProxiableUUID is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x52d1902d.
//
// Solidity: function proxiableUUID() view returns(bytes32)
func (sacd *Sacd) PackProxiableUUID() []byte {
	enc, err := sacd.abi.Pack("proxiableUUID")
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackProxiableUUID is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x52d1902d.
//
// Solidity: function proxiableUUID() view returns(bytes32)
func (sacd *Sacd) UnpackProxiableUUID(data []byte) ([32]byte, error) {
	out, err := sacd.abi.Unpack("proxiableUUID", data)
	if err != nil {
		return *new([32]byte), err
	}
	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)
	return out0, err
}

// PackRenounceRole is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x36568abe.
//
// Solidity: function renounceRole(bytes32 role, address callerConfirmation) returns()
func (sacd *Sacd) PackRenounceRole(role [32]byte, callerConfirmation common.Address) []byte {
	enc, err := sacd.abi.Pack("renounceRole", role, callerConfirmation)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackRevokeRole is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xd547741f.
//
// Solidity: function revokeRole(bytes32 role, address account) returns()
func (sacd *Sacd) PackRevokeRole(role [32]byte, account common.Address) []byte {
	enc, err := sacd.abi.Pack("revokeRole", role, account)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackSetPayment is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xa23cac39.
//
// Solidity: function setPayment(address asset, address grantor, uint256 amount, uint64 expiration, bytes3 currency, string source) returns()
func (sacd *Sacd) PackSetPayment(asset common.Address, grantor common.Address, amount *big.Int, expiration uint64, currency [3]byte, source string) []byte {
	enc, err := sacd.abi.Pack("setPayment", asset, grantor, amount, expiration, currency, source)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackSetPermissions is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x02e690e4.
//
// Solidity: function setPermissions(address asset, uint256 tokenId, address grantee, uint256 permissions, uint256 expiration, uint256 templateId, string source) returns()
func (sacd *Sacd) PackSetPermissions(asset common.Address, tokenId *big.Int, grantee common.Address, permissions *big.Int, expiration *big.Int, templateId *big.Int, source string) []byte {
	enc, err := sacd.abi.Pack("setPermissions", asset, tokenId, grantee, permissions, expiration, templateId, source)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackSetPermissions0 is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xe711f339.
//
// Solidity: function setPermissions(address asset, uint256 tokenId, address grantee, uint256 permissions, uint256 expiration, string source) returns()
func (sacd *Sacd) PackSetPermissions0(asset common.Address, tokenId *big.Int, grantee common.Address, permissions *big.Int, expiration *big.Int, source string) []byte {
	enc, err := sacd.abi.Pack("setPermissions0", asset, tokenId, grantee, permissions, expiration, source)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackSetTemplateContract is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x670983fa.
//
// Solidity: function setTemplateContract(address templateContractAddress) returns()
func (sacd *Sacd) PackSetTemplateContract(templateContractAddress common.Address) []byte {
	enc, err := sacd.abi.Pack("setTemplateContract", templateContractAddress)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackSupportsInterface is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (sacd *Sacd) PackSupportsInterface(interfaceId [4]byte) []byte {
	enc, err := sacd.abi.Pack("supportsInterface", interfaceId)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackSupportsInterface is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (sacd *Sacd) UnpackSupportsInterface(data []byte) (bool, error) {
	out, err := sacd.abi.Unpack("supportsInterface", data)
	if err != nil {
		return *new(bool), err
	}
	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)
	return out0, err
}

// PackTemplateContract is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x72be06d8.
//
// Solidity: function templateContract() view returns(address template_)
func (sacd *Sacd) PackTemplateContract() []byte {
	enc, err := sacd.abi.Pack("templateContract")
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackTemplateContract is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x72be06d8.
//
// Solidity: function templateContract() view returns(address template_)
func (sacd *Sacd) UnpackTemplateContract(data []byte) (common.Address, error) {
	out, err := sacd.abi.Unpack("templateContract", data)
	if err != nil {
		return *new(common.Address), err
	}
	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)
	return out0, err
}

// PackTokenIdToVersion is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xeba57928.
//
// Solidity: function tokenIdToVersion(address asset, uint256 tokenId) view returns(uint256 version)
func (sacd *Sacd) PackTokenIdToVersion(asset common.Address, tokenId *big.Int) []byte {
	enc, err := sacd.abi.Pack("tokenIdToVersion", asset, tokenId)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackTokenIdToVersion is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0xeba57928.
//
// Solidity: function tokenIdToVersion(address asset, uint256 tokenId) view returns(uint256 version)
func (sacd *Sacd) UnpackTokenIdToVersion(data []byte) (*big.Int, error) {
	out, err := sacd.abi.Unpack("tokenIdToVersion", data)
	if err != nil {
		return new(big.Int), err
	}
	out0 := abi.ConvertType(out[0], new(big.Int)).(*big.Int)
	return out0, err
}

// PackUpgradeToAndCall is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x4f1ef286.
//
// Solidity: function upgradeToAndCall(address newImplementation, bytes data) payable returns()
func (sacd *Sacd) PackUpgradeToAndCall(newImplementation common.Address, data []byte) []byte {
	enc, err := sacd.abi.Pack("upgradeToAndCall", newImplementation, data)
	if err != nil {
		panic(err)
	}
	return enc
}

// SacdInitialized represents a Initialized event raised by the Sacd contract.
type SacdInitialized struct {
	Version uint64
	Raw     *types.Log // Blockchain specific contextual infos
}

const SacdInitializedEventName = "Initialized"

// ContractEventName returns the user-defined event name.
func (SacdInitialized) ContractEventName() string {
	return SacdInitializedEventName
}

// UnpackInitializedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event Initialized(uint64 version)
func (sacd *Sacd) UnpackInitializedEvent(log *types.Log) (*SacdInitialized, error) {
	event := "Initialized"
	if log.Topics[0] != sacd.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(SacdInitialized)
	if len(log.Data) > 0 {
		if err := sacd.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range sacd.abi.Events[event].Inputs {
		if arg.Indexed {
			indexed = append(indexed, arg)
		}
	}
	if err := abi.ParseTopics(out, indexed, log.Topics[1:]); err != nil {
		return nil, err
	}
	out.Raw = log
	return out, nil
}

// SacdPaymentSet represents a PaymentSet event raised by the Sacd contract.
type SacdPaymentSet struct {
	Asset      common.Address
	Grantee    common.Address
	Grantor    common.Address
	Amount     *big.Int
	Expiration *big.Int
	Source     string
	Raw        *types.Log // Blockchain specific contextual infos
}

const SacdPaymentSetEventName = "PaymentSet"

// ContractEventName returns the user-defined event name.
func (SacdPaymentSet) ContractEventName() string {
	return SacdPaymentSetEventName
}

// UnpackPaymentSetEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event PaymentSet(address indexed asset, address indexed grantee, address indexed grantor, uint256 amount, uint256 expiration, string source)
func (sacd *Sacd) UnpackPaymentSetEvent(log *types.Log) (*SacdPaymentSet, error) {
	event := "PaymentSet"
	if log.Topics[0] != sacd.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(SacdPaymentSet)
	if len(log.Data) > 0 {
		if err := sacd.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range sacd.abi.Events[event].Inputs {
		if arg.Indexed {
			indexed = append(indexed, arg)
		}
	}
	if err := abi.ParseTopics(out, indexed, log.Topics[1:]); err != nil {
		return nil, err
	}
	out.Raw = log
	return out, nil
}

// SacdPermissionsSet represents a PermissionsSet event raised by the Sacd contract.
type SacdPermissionsSet struct {
	Asset       common.Address
	TokenId     *big.Int
	Permissions *big.Int
	Grantee     common.Address
	Expiration  *big.Int
	TemplateId  *big.Int
	Source      string
	Raw         *types.Log // Blockchain specific contextual infos
}

const SacdPermissionsSetEventName = "PermissionsSet"

// ContractEventName returns the user-defined event name.
func (SacdPermissionsSet) ContractEventName() string {
	return SacdPermissionsSetEventName
}

// UnpackPermissionsSetEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event PermissionsSet(address indexed asset, uint256 indexed tokenId, uint256 permissions, address indexed grantee, uint256 expiration, uint256 templateId, string source)
func (sacd *Sacd) UnpackPermissionsSetEvent(log *types.Log) (*SacdPermissionsSet, error) {
	event := "PermissionsSet"
	if log.Topics[0] != sacd.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(SacdPermissionsSet)
	if len(log.Data) > 0 {
		if err := sacd.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range sacd.abi.Events[event].Inputs {
		if arg.Indexed {
			indexed = append(indexed, arg)
		}
	}
	if err := abi.ParseTopics(out, indexed, log.Topics[1:]); err != nil {
		return nil, err
	}
	out.Raw = log
	return out, nil
}

// SacdRoleAdminChanged represents a RoleAdminChanged event raised by the Sacd contract.
type SacdRoleAdminChanged struct {
	Role              [32]byte
	PreviousAdminRole [32]byte
	NewAdminRole      [32]byte
	Raw               *types.Log // Blockchain specific contextual infos
}

const SacdRoleAdminChangedEventName = "RoleAdminChanged"

// ContractEventName returns the user-defined event name.
func (SacdRoleAdminChanged) ContractEventName() string {
	return SacdRoleAdminChangedEventName
}

// UnpackRoleAdminChangedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
func (sacd *Sacd) UnpackRoleAdminChangedEvent(log *types.Log) (*SacdRoleAdminChanged, error) {
	event := "RoleAdminChanged"
	if log.Topics[0] != sacd.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(SacdRoleAdminChanged)
	if len(log.Data) > 0 {
		if err := sacd.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range sacd.abi.Events[event].Inputs {
		if arg.Indexed {
			indexed = append(indexed, arg)
		}
	}
	if err := abi.ParseTopics(out, indexed, log.Topics[1:]); err != nil {
		return nil, err
	}
	out.Raw = log
	return out, nil
}

// SacdRoleGranted represents a RoleGranted event raised by the Sacd contract.
type SacdRoleGranted struct {
	Role    [32]byte
	Account common.Address
	Sender  common.Address
	Raw     *types.Log // Blockchain specific contextual infos
}

const SacdRoleGrantedEventName = "RoleGranted"

// ContractEventName returns the user-defined event name.
func (SacdRoleGranted) ContractEventName() string {
	return SacdRoleGrantedEventName
}

// UnpackRoleGrantedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
func (sacd *Sacd) UnpackRoleGrantedEvent(log *types.Log) (*SacdRoleGranted, error) {
	event := "RoleGranted"
	if log.Topics[0] != sacd.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(SacdRoleGranted)
	if len(log.Data) > 0 {
		if err := sacd.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range sacd.abi.Events[event].Inputs {
		if arg.Indexed {
			indexed = append(indexed, arg)
		}
	}
	if err := abi.ParseTopics(out, indexed, log.Topics[1:]); err != nil {
		return nil, err
	}
	out.Raw = log
	return out, nil
}

// SacdRoleRevoked represents a RoleRevoked event raised by the Sacd contract.
type SacdRoleRevoked struct {
	Role    [32]byte
	Account common.Address
	Sender  common.Address
	Raw     *types.Log // Blockchain specific contextual infos
}

const SacdRoleRevokedEventName = "RoleRevoked"

// ContractEventName returns the user-defined event name.
func (SacdRoleRevoked) ContractEventName() string {
	return SacdRoleRevokedEventName
}

// UnpackRoleRevokedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
func (sacd *Sacd) UnpackRoleRevokedEvent(log *types.Log) (*SacdRoleRevoked, error) {
	event := "RoleRevoked"
	if log.Topics[0] != sacd.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(SacdRoleRevoked)
	if len(log.Data) > 0 {
		if err := sacd.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range sacd.abi.Events[event].Inputs {
		if arg.Indexed {
			indexed = append(indexed, arg)
		}
	}
	if err := abi.ParseTopics(out, indexed, log.Topics[1:]); err != nil {
		return nil, err
	}
	out.Raw = log
	return out, nil
}

// SacdUpgraded represents a Upgraded event raised by the Sacd contract.
type SacdUpgraded struct {
	Implementation common.Address
	Raw            *types.Log // Blockchain specific contextual infos
}

const SacdUpgradedEventName = "Upgraded"

// ContractEventName returns the user-defined event name.
func (SacdUpgraded) ContractEventName() string {
	return SacdUpgradedEventName
}

// UnpackUpgradedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event Upgraded(address indexed implementation)
func (sacd *Sacd) UnpackUpgradedEvent(log *types.Log) (*SacdUpgraded, error) {
	event := "Upgraded"
	if log.Topics[0] != sacd.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(SacdUpgraded)
	if len(log.Data) > 0 {
		if err := sacd.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range sacd.abi.Events[event].Inputs {
		if arg.Indexed {
			indexed = append(indexed, arg)
		}
	}
	if err := abi.ParseTopics(out, indexed, log.Topics[1:]); err != nil {
		return nil, err
	}
	out.Raw = log
	return out, nil
}

// UnpackError attempts to decode the provided error data using user-defined
// error definitions.
func (sacd *Sacd) UnpackError(raw []byte) (any, error) {
	if bytes.Equal(raw[:4], sacd.abi.Errors["AccessControlBadConfirmation"].ID.Bytes()[:4]) {
		return sacd.UnpackAccessControlBadConfirmationError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["AccessControlUnauthorizedAccount"].ID.Bytes()[:4]) {
		return sacd.UnpackAccessControlUnauthorizedAccountError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["AddressEmptyCode"].ID.Bytes()[:4]) {
		return sacd.UnpackAddressEmptyCodeError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["ERC1967InvalidImplementation"].ID.Bytes()[:4]) {
		return sacd.UnpackERC1967InvalidImplementationError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["ERC1967NonPayable"].ID.Bytes()[:4]) {
		return sacd.UnpackERC1967NonPayableError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["FailedInnerCall"].ID.Bytes()[:4]) {
		return sacd.UnpackFailedInnerCallError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["InvalidCurrency"].ID.Bytes()[:4]) {
		return sacd.UnpackInvalidCurrencyError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["InvalidInitialization"].ID.Bytes()[:4]) {
		return sacd.UnpackInvalidInitializationError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["InvalidTokenId"].ID.Bytes()[:4]) {
		return sacd.UnpackInvalidTokenIdError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["NotInitializing"].ID.Bytes()[:4]) {
		return sacd.UnpackNotInitializingError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["TemplateAssetMismatch"].ID.Bytes()[:4]) {
		return sacd.UnpackTemplateAssetMismatchError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["TemplateContractNotSet"].ID.Bytes()[:4]) {
		return sacd.UnpackTemplateContractNotSetError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["TemplateNotActive"].ID.Bytes()[:4]) {
		return sacd.UnpackTemplateNotActiveError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["TemplatePermissionsMismatch"].ID.Bytes()[:4]) {
		return sacd.UnpackTemplatePermissionsMismatchError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["UUPSUnauthorizedCallContext"].ID.Bytes()[:4]) {
		return sacd.UnpackUUPSUnauthorizedCallContextError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["UUPSUnsupportedProxiableUUID"].ID.Bytes()[:4]) {
		return sacd.UnpackUUPSUnsupportedProxiableUUIDError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["Unauthorized"].ID.Bytes()[:4]) {
		return sacd.UnpackUnauthorizedError(raw[4:])
	}
	if bytes.Equal(raw[:4], sacd.abi.Errors["ZeroAddress"].ID.Bytes()[:4]) {
		return sacd.UnpackZeroAddressError(raw[4:])
	}
	return nil, errors.New("Unknown error")
}

// SacdAccessControlBadConfirmation represents a AccessControlBadConfirmation error raised by the Sacd contract.
type SacdAccessControlBadConfirmation struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error AccessControlBadConfirmation()
func SacdAccessControlBadConfirmationErrorID() common.Hash {
	return common.HexToHash("0x6697b23232a647058342c0724fe7c415cab25915b54e5dbc03f233173d37b41c")
}

// UnpackAccessControlBadConfirmationError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error AccessControlBadConfirmation()
func (sacd *Sacd) UnpackAccessControlBadConfirmationError(raw []byte) (*SacdAccessControlBadConfirmation, error) {
	out := new(SacdAccessControlBadConfirmation)
	if err := sacd.abi.UnpackIntoInterface(out, "AccessControlBadConfirmation", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdAccessControlUnauthorizedAccount represents a AccessControlUnauthorizedAccount error raised by the Sacd contract.
type SacdAccessControlUnauthorizedAccount struct {
	Account    common.Address
	NeededRole [32]byte
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)
func SacdAccessControlUnauthorizedAccountErrorID() common.Hash {
	return common.HexToHash("0xe2517d3fbfae6f8515ef5ff1ccedc3933ab0cbbda0b492c06eb54ad10ef03b3e")
}

// UnpackAccessControlUnauthorizedAccountError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)
func (sacd *Sacd) UnpackAccessControlUnauthorizedAccountError(raw []byte) (*SacdAccessControlUnauthorizedAccount, error) {
	out := new(SacdAccessControlUnauthorizedAccount)
	if err := sacd.abi.UnpackIntoInterface(out, "AccessControlUnauthorizedAccount", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdAddressEmptyCode represents a AddressEmptyCode error raised by the Sacd contract.
type SacdAddressEmptyCode struct {
	Target common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error AddressEmptyCode(address target)
func SacdAddressEmptyCodeErrorID() common.Hash {
	return common.HexToHash("0x9996b315c842ff135b8fc4a08ad5df1c344efbc03d2687aecc0678050d2aac89")
}

// UnpackAddressEmptyCodeError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error AddressEmptyCode(address target)
func (sacd *Sacd) UnpackAddressEmptyCodeError(raw []byte) (*SacdAddressEmptyCode, error) {
	out := new(SacdAddressEmptyCode)
	if err := sacd.abi.UnpackIntoInterface(out, "AddressEmptyCode", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdERC1967InvalidImplementation represents a ERC1967InvalidImplementation error raised by the Sacd contract.
type SacdERC1967InvalidImplementation struct {
	Implementation common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC1967InvalidImplementation(address implementation)
func SacdERC1967InvalidImplementationErrorID() common.Hash {
	return common.HexToHash("0x4c9c8ce3ceb3130f17f7cdba48d89b5b0129f266a8bac114e6e315a41879b617")
}

// UnpackERC1967InvalidImplementationError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC1967InvalidImplementation(address implementation)
func (sacd *Sacd) UnpackERC1967InvalidImplementationError(raw []byte) (*SacdERC1967InvalidImplementation, error) {
	out := new(SacdERC1967InvalidImplementation)
	if err := sacd.abi.UnpackIntoInterface(out, "ERC1967InvalidImplementation", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdERC1967NonPayable represents a ERC1967NonPayable error raised by the Sacd contract.
type SacdERC1967NonPayable struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC1967NonPayable()
func SacdERC1967NonPayableErrorID() common.Hash {
	return common.HexToHash("0xb398979fa84f543c8e222f17890372c487baf85e062276c127fef521eea7224b")
}

// UnpackERC1967NonPayableError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC1967NonPayable()
func (sacd *Sacd) UnpackERC1967NonPayableError(raw []byte) (*SacdERC1967NonPayable, error) {
	out := new(SacdERC1967NonPayable)
	if err := sacd.abi.UnpackIntoInterface(out, "ERC1967NonPayable", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdFailedInnerCall represents a FailedInnerCall error raised by the Sacd contract.
type SacdFailedInnerCall struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error FailedInnerCall()
func SacdFailedInnerCallErrorID() common.Hash {
	return common.HexToHash("0x1425ea42df7c932537f94e8b917ea9c5931f140fb6e8098822ef05dc56222ca9")
}

// UnpackFailedInnerCallError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error FailedInnerCall()
func (sacd *Sacd) UnpackFailedInnerCallError(raw []byte) (*SacdFailedInnerCall, error) {
	out := new(SacdFailedInnerCall)
	if err := sacd.abi.UnpackIntoInterface(out, "FailedInnerCall", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdInvalidCurrency represents a InvalidCurrency error raised by the Sacd contract.
type SacdInvalidCurrency struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error InvalidCurrency()
func SacdInvalidCurrencyErrorID() common.Hash {
	return common.HexToHash("0xf599342860182785a093c975eac7ed1d5340f19a20b09f8fd8851b48cd3b23ae")
}

// UnpackInvalidCurrencyError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error InvalidCurrency()
func (sacd *Sacd) UnpackInvalidCurrencyError(raw []byte) (*SacdInvalidCurrency, error) {
	out := new(SacdInvalidCurrency)
	if err := sacd.abi.UnpackIntoInterface(out, "InvalidCurrency", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdInvalidInitialization represents a InvalidInitialization error raised by the Sacd contract.
type SacdInvalidInitialization struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error InvalidInitialization()
func SacdInvalidInitializationErrorID() common.Hash {
	return common.HexToHash("0xf92ee8a957075833165f68c320933b1a1294aafc84ee6e0dd3fb178008f9aaf5")
}

// UnpackInvalidInitializationError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error InvalidInitialization()
func (sacd *Sacd) UnpackInvalidInitializationError(raw []byte) (*SacdInvalidInitialization, error) {
	out := new(SacdInvalidInitialization)
	if err := sacd.abi.UnpackIntoInterface(out, "InvalidInitialization", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdInvalidTokenId represents a InvalidTokenId error raised by the Sacd contract.
type SacdInvalidTokenId struct {
	Asset   common.Address
	TokenId *big.Int
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error InvalidTokenId(address asset, uint256 tokenId)
func SacdInvalidTokenIdErrorID() common.Hash {
	return common.HexToHash("0x1912ea51fef136ddf32684ab07989d8fcd551ac8395d7f76010f2f06671ea26b")
}

// UnpackInvalidTokenIdError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error InvalidTokenId(address asset, uint256 tokenId)
func (sacd *Sacd) UnpackInvalidTokenIdError(raw []byte) (*SacdInvalidTokenId, error) {
	out := new(SacdInvalidTokenId)
	if err := sacd.abi.UnpackIntoInterface(out, "InvalidTokenId", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdNotInitializing represents a NotInitializing error raised by the Sacd contract.
type SacdNotInitializing struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error NotInitializing()
func SacdNotInitializingErrorID() common.Hash {
	return common.HexToHash("0xd7e6bcf8597daa127dc9f0048d2f08d5ef140a2cb659feabd700beff1f7a8302")
}

// UnpackNotInitializingError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error NotInitializing()
func (sacd *Sacd) UnpackNotInitializingError(raw []byte) (*SacdNotInitializing, error) {
	out := new(SacdNotInitializing)
	if err := sacd.abi.UnpackIntoInterface(out, "NotInitializing", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdTemplateAssetMismatch represents a TemplateAssetMismatch error raised by the Sacd contract.
type SacdTemplateAssetMismatch struct {
	TemplateId    *big.Int
	ExpectedAsset common.Address
	ProvidedAsset common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error TemplateAssetMismatch(uint256 templateId, address expectedAsset, address providedAsset)
func SacdTemplateAssetMismatchErrorID() common.Hash {
	return common.HexToHash("0x2de2bda5a4e4d6a947e73e3777772824607374636b1f5fe3015aae31cc879b81")
}

// UnpackTemplateAssetMismatchError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error TemplateAssetMismatch(uint256 templateId, address expectedAsset, address providedAsset)
func (sacd *Sacd) UnpackTemplateAssetMismatchError(raw []byte) (*SacdTemplateAssetMismatch, error) {
	out := new(SacdTemplateAssetMismatch)
	if err := sacd.abi.UnpackIntoInterface(out, "TemplateAssetMismatch", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdTemplateContractNotSet represents a TemplateContractNotSet error raised by the Sacd contract.
type SacdTemplateContractNotSet struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error TemplateContractNotSet()
func SacdTemplateContractNotSetErrorID() common.Hash {
	return common.HexToHash("0x0b5f011fa44787bf67f20f724b522214118db727490a5f4f89e281d876c10434")
}

// UnpackTemplateContractNotSetError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error TemplateContractNotSet()
func (sacd *Sacd) UnpackTemplateContractNotSetError(raw []byte) (*SacdTemplateContractNotSet, error) {
	out := new(SacdTemplateContractNotSet)
	if err := sacd.abi.UnpackIntoInterface(out, "TemplateContractNotSet", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdTemplateNotActive represents a TemplateNotActive error raised by the Sacd contract.
type SacdTemplateNotActive struct {
	TemplateId *big.Int
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error TemplateNotActive(uint256 templateId)
func SacdTemplateNotActiveErrorID() common.Hash {
	return common.HexToHash("0x2125441a111b8ff2070bb0461eb6ecba36ab3a2a857ce1a9b7401fdb03cb6389")
}

// UnpackTemplateNotActiveError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error TemplateNotActive(uint256 templateId)
func (sacd *Sacd) UnpackTemplateNotActiveError(raw []byte) (*SacdTemplateNotActive, error) {
	out := new(SacdTemplateNotActive)
	if err := sacd.abi.UnpackIntoInterface(out, "TemplateNotActive", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdTemplatePermissionsMismatch represents a TemplatePermissionsMismatch error raised by the Sacd contract.
type SacdTemplatePermissionsMismatch struct {
	TemplateId          *big.Int
	ExpectedPermissions *big.Int
	ProvidedPermissions *big.Int
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error TemplatePermissionsMismatch(uint256 templateId, uint256 expectedPermissions, uint256 providedPermissions)
func SacdTemplatePermissionsMismatchErrorID() common.Hash {
	return common.HexToHash("0x3b911b487b1d2e5a5d766a8aea279d31ba1bc8fa3ab77f27ea8fa27b78970e88")
}

// UnpackTemplatePermissionsMismatchError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error TemplatePermissionsMismatch(uint256 templateId, uint256 expectedPermissions, uint256 providedPermissions)
func (sacd *Sacd) UnpackTemplatePermissionsMismatchError(raw []byte) (*SacdTemplatePermissionsMismatch, error) {
	out := new(SacdTemplatePermissionsMismatch)
	if err := sacd.abi.UnpackIntoInterface(out, "TemplatePermissionsMismatch", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdUUPSUnauthorizedCallContext represents a UUPSUnauthorizedCallContext error raised by the Sacd contract.
type SacdUUPSUnauthorizedCallContext struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error UUPSUnauthorizedCallContext()
func SacdUUPSUnauthorizedCallContextErrorID() common.Hash {
	return common.HexToHash("0xe07c8dba242a06571ac65fe4bbe20522c9fb111cb33599b799ff8039c1ed18f4")
}

// UnpackUUPSUnauthorizedCallContextError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error UUPSUnauthorizedCallContext()
func (sacd *Sacd) UnpackUUPSUnauthorizedCallContextError(raw []byte) (*SacdUUPSUnauthorizedCallContext, error) {
	out := new(SacdUUPSUnauthorizedCallContext)
	if err := sacd.abi.UnpackIntoInterface(out, "UUPSUnauthorizedCallContext", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdUUPSUnsupportedProxiableUUID represents a UUPSUnsupportedProxiableUUID error raised by the Sacd contract.
type SacdUUPSUnsupportedProxiableUUID struct {
	Slot [32]byte
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error UUPSUnsupportedProxiableUUID(bytes32 slot)
func SacdUUPSUnsupportedProxiableUUIDErrorID() common.Hash {
	return common.HexToHash("0xaa1d49a4c084bfa9aeeee2a0be65267a7f19ba7e1476b114dac513d2c14cb563")
}

// UnpackUUPSUnsupportedProxiableUUIDError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error UUPSUnsupportedProxiableUUID(bytes32 slot)
func (sacd *Sacd) UnpackUUPSUnsupportedProxiableUUIDError(raw []byte) (*SacdUUPSUnsupportedProxiableUUID, error) {
	out := new(SacdUUPSUnsupportedProxiableUUID)
	if err := sacd.abi.UnpackIntoInterface(out, "UUPSUnsupportedProxiableUUID", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdUnauthorized represents a Unauthorized error raised by the Sacd contract.
type SacdUnauthorized struct {
	Addr common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error Unauthorized(address addr)
func SacdUnauthorizedErrorID() common.Hash {
	return common.HexToHash("0x8e4a23d6a5d81f013eca4bc92aeb9214ccafcaebd1f097c350c922d6e19122d5")
}

// UnpackUnauthorizedError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error Unauthorized(address addr)
func (sacd *Sacd) UnpackUnauthorizedError(raw []byte) (*SacdUnauthorized, error) {
	out := new(SacdUnauthorized)
	if err := sacd.abi.UnpackIntoInterface(out, "Unauthorized", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// SacdZeroAddress represents a ZeroAddress error raised by the Sacd contract.
type SacdZeroAddress struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ZeroAddress()
func SacdZeroAddressErrorID() common.Hash {
	return common.HexToHash("0xd92e233df2717d4a40030e20904abd27b68fcbeede117eaaccbbdac9618c8c73")
}

// UnpackZeroAddressError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ZeroAddress()
func (sacd *Sacd) UnpackZeroAddressError(raw []byte) (*SacdZeroAddress, error) {
	out := new(SacdZeroAddress)
	if err := sacd.abi.UnpackIntoInterface(out, "ZeroAddress", raw); err != nil {
		return nil, err
	}
	return out, nil
}
