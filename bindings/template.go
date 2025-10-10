// Code generated via abigen V2 - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package bindings

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

// ITemplateTemplateData is an auto generated low-level Go binding around an user-defined struct.
type ITemplateTemplateData struct {
	Asset       common.Address
	Permissions *big.Int
	Source      string
	IsActive    bool
}

// TemplateMetaData contains all meta data concerning the Template contract.
var TemplateMetaData = bind.MetaData{
	ABI: "[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"AccessControlBadConfirmation\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"neededRole\",\"type\":\"bytes32\"}],\"name\":\"AccessControlUnauthorizedAccount\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"target\",\"type\":\"address\"}],\"name\":\"AddressEmptyCode\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"implementation\",\"type\":\"address\"}],\"name\":\"ERC1967InvalidImplementation\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"ERC1967NonPayable\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"ERC721IncorrectOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ERC721InsufficientApproval\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"approver\",\"type\":\"address\"}],\"name\":\"ERC721InvalidApprover\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"ERC721InvalidOperator\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"ERC721InvalidOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"receiver\",\"type\":\"address\"}],\"name\":\"ERC721InvalidReceiver\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"ERC721InvalidSender\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ERC721NonexistentToken\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"FailedInnerCall\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidInitialization\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidTemplateData\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"NotInitializing\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"TemplateAlreadyActivated\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"TemplateAlreadyDeactivated\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"TemplateAlreadyExists\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"TemplateNotFound\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"UUPSUnauthorizedCallContext\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"slot\",\"type\":\"bytes32\"}],\"name\":\"UUPSUnsupportedProxiableUUID\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"Unauthorized\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"approved\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"ApprovalForAll\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint64\",\"name\":\"version\",\"type\":\"uint64\"}],\"name\":\"Initialized\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"previousAdminRole\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"newAdminRole\",\"type\":\"bytes32\"}],\"name\":\"RoleAdminChanged\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"RoleGranted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"RoleRevoked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"TemplateActivated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"creator\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"cid\",\"type\":\"string\"}],\"name\":\"TemplateCreated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"TemplateDeactivated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"implementation\",\"type\":\"address\"}],\"name\":\"Upgraded\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"DEFAULT_ADMIN_ROLE\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"UPGRADE_INTERFACE_VERSION\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"activateTemplate\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"baseURI\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"cid\",\"type\":\"string\"}],\"name\":\"createTemplate\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"deactivateTemplate\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"getApproved\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"}],\"name\":\"getRoleAdmin\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"getTemplate\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"},{\"internalType\":\"bool\",\"name\":\"isActive\",\"type\":\"bool\"}],\"internalType\":\"structITemplate.TemplateData\",\"name\":\"template\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"grantRole\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"hasRole\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"admin\",\"type\":\"address\"},{\"internalType\":\"string\",\"name\":\"baseURI_\",\"type\":\"string\"}],\"name\":\"initialize\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"isApprovedForAll\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"isTemplateActive\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"isActive\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ownerOf\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"proxiableUUID\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"callerConfirmation\",\"type\":\"address\"}],\"name\":\"renounceRole\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"revokeRole\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"safeTransferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"safeTransferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"setApprovalForAll\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"templateId\",\"type\":\"uint256\"}],\"name\":\"templates\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"asset\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"permissions\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"source\",\"type\":\"string\"},{\"internalType\":\"bool\",\"name\":\"isActive\",\"type\":\"bool\"}],\"internalType\":\"structITemplate.TemplateData\",\"name\":\"templateData\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"tokenURI\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newImplementation\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"upgradeToAndCall\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"}]",
	ID:  "Template",
}

// Template is an auto generated Go binding around an Ethereum contract.
type Template struct {
	abi abi.ABI
}

// NewTemplate creates a new instance of Template.
func NewTemplate() *Template {
	parsed, err := TemplateMetaData.ParseABI()
	if err != nil {
		panic(errors.New("invalid ABI: " + err.Error()))
	}
	return &Template{abi: *parsed}
}

// Instance creates a wrapper for a deployed contract instance at the given address.
// Use this to create the instance object passed to abigen v2 library functions Call, Transact, etc.
func (c *Template) Instance(backend bind.ContractBackend, addr common.Address) *bind.BoundContract {
	return bind.NewBoundContract(addr, c.abi, backend, backend, backend)
}

// PackDEFAULTADMINROLE is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xa217fddf.
//
// Solidity: function DEFAULT_ADMIN_ROLE() view returns(bytes32)
func (template *Template) PackDEFAULTADMINROLE() []byte {
	enc, err := template.abi.Pack("DEFAULT_ADMIN_ROLE")
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackDEFAULTADMINROLE is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0xa217fddf.
//
// Solidity: function DEFAULT_ADMIN_ROLE() view returns(bytes32)
func (template *Template) UnpackDEFAULTADMINROLE(data []byte) ([32]byte, error) {
	out, err := template.abi.Unpack("DEFAULT_ADMIN_ROLE", data)
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
func (template *Template) PackUPGRADEINTERFACEVERSION() []byte {
	enc, err := template.abi.Pack("UPGRADE_INTERFACE_VERSION")
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackUPGRADEINTERFACEVERSION is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0xad3cb1cc.
//
// Solidity: function UPGRADE_INTERFACE_VERSION() view returns(string)
func (template *Template) UnpackUPGRADEINTERFACEVERSION(data []byte) (string, error) {
	out, err := template.abi.Unpack("UPGRADE_INTERFACE_VERSION", data)
	if err != nil {
		return *new(string), err
	}
	out0 := *abi.ConvertType(out[0], new(string)).(*string)
	return out0, err
}

// PackActivateTemplate is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x9e060763.
//
// Solidity: function activateTemplate(uint256 templateId) returns()
func (template *Template) PackActivateTemplate(templateId *big.Int) []byte {
	enc, err := template.abi.Pack("activateTemplate", templateId)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackApprove is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x095ea7b3.
//
// Solidity: function approve(address to, uint256 tokenId) returns()
func (template *Template) PackApprove(to common.Address, tokenId *big.Int) []byte {
	enc, err := template.abi.Pack("approve", to, tokenId)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackBalanceOf is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x70a08231.
//
// Solidity: function balanceOf(address owner) view returns(uint256)
func (template *Template) PackBalanceOf(owner common.Address) []byte {
	enc, err := template.abi.Pack("balanceOf", owner)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackBalanceOf is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x70a08231.
//
// Solidity: function balanceOf(address owner) view returns(uint256)
func (template *Template) UnpackBalanceOf(data []byte) (*big.Int, error) {
	out, err := template.abi.Unpack("balanceOf", data)
	if err != nil {
		return new(big.Int), err
	}
	out0 := abi.ConvertType(out[0], new(big.Int)).(*big.Int)
	return out0, err
}

// PackBaseURI is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x6c0360eb.
//
// Solidity: function baseURI() view returns(string)
func (template *Template) PackBaseURI() []byte {
	enc, err := template.abi.Pack("baseURI")
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackBaseURI is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x6c0360eb.
//
// Solidity: function baseURI() view returns(string)
func (template *Template) UnpackBaseURI(data []byte) (string, error) {
	out, err := template.abi.Unpack("baseURI", data)
	if err != nil {
		return *new(string), err
	}
	out0 := *abi.ConvertType(out[0], new(string)).(*string)
	return out0, err
}

// PackCreateTemplate is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x060ff5b9.
//
// Solidity: function createTemplate(address owner, address asset, uint256 permissions, string cid) returns(uint256 templateId)
func (template *Template) PackCreateTemplate(owner common.Address, asset common.Address, permissions *big.Int, cid string) []byte {
	enc, err := template.abi.Pack("createTemplate", owner, asset, permissions, cid)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackCreateTemplate is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x060ff5b9.
//
// Solidity: function createTemplate(address owner, address asset, uint256 permissions, string cid) returns(uint256 templateId)
func (template *Template) UnpackCreateTemplate(data []byte) (*big.Int, error) {
	out, err := template.abi.Unpack("createTemplate", data)
	if err != nil {
		return new(big.Int), err
	}
	out0 := abi.ConvertType(out[0], new(big.Int)).(*big.Int)
	return out0, err
}

// PackDeactivateTemplate is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x1d1a689e.
//
// Solidity: function deactivateTemplate(uint256 templateId) returns()
func (template *Template) PackDeactivateTemplate(templateId *big.Int) []byte {
	enc, err := template.abi.Pack("deactivateTemplate", templateId)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackGetApproved is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x081812fc.
//
// Solidity: function getApproved(uint256 tokenId) view returns(address)
func (template *Template) PackGetApproved(tokenId *big.Int) []byte {
	enc, err := template.abi.Pack("getApproved", tokenId)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackGetApproved is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x081812fc.
//
// Solidity: function getApproved(uint256 tokenId) view returns(address)
func (template *Template) UnpackGetApproved(data []byte) (common.Address, error) {
	out, err := template.abi.Unpack("getApproved", data)
	if err != nil {
		return *new(common.Address), err
	}
	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)
	return out0, err
}

// PackGetRoleAdmin is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x248a9ca3.
//
// Solidity: function getRoleAdmin(bytes32 role) view returns(bytes32)
func (template *Template) PackGetRoleAdmin(role [32]byte) []byte {
	enc, err := template.abi.Pack("getRoleAdmin", role)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackGetRoleAdmin is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x248a9ca3.
//
// Solidity: function getRoleAdmin(bytes32 role) view returns(bytes32)
func (template *Template) UnpackGetRoleAdmin(data []byte) ([32]byte, error) {
	out, err := template.abi.Unpack("getRoleAdmin", data)
	if err != nil {
		return *new([32]byte), err
	}
	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)
	return out0, err
}

// PackGetTemplate is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x31543cf4.
//
// Solidity: function getTemplate(uint256 templateId) view returns((address,uint256,string,bool) template)
func (template *Template) PackGetTemplate(templateId *big.Int) []byte {
	enc, err := template.abi.Pack("getTemplate", templateId)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackGetTemplate is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x31543cf4.
//
// Solidity: function getTemplate(uint256 templateId) view returns((address,uint256,string,bool) template)
func (template *Template) UnpackGetTemplate(data []byte) (ITemplateTemplateData, error) {
	out, err := template.abi.Unpack("getTemplate", data)
	if err != nil {
		return *new(ITemplateTemplateData), err
	}
	out0 := *abi.ConvertType(out[0], new(ITemplateTemplateData)).(*ITemplateTemplateData)
	return out0, err
}

// PackGrantRole is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x2f2ff15d.
//
// Solidity: function grantRole(bytes32 role, address account) returns()
func (template *Template) PackGrantRole(role [32]byte, account common.Address) []byte {
	enc, err := template.abi.Pack("grantRole", role, account)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackHasRole is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x91d14854.
//
// Solidity: function hasRole(bytes32 role, address account) view returns(bool)
func (template *Template) PackHasRole(role [32]byte, account common.Address) []byte {
	enc, err := template.abi.Pack("hasRole", role, account)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackHasRole is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x91d14854.
//
// Solidity: function hasRole(bytes32 role, address account) view returns(bool)
func (template *Template) UnpackHasRole(data []byte) (bool, error) {
	out, err := template.abi.Unpack("hasRole", data)
	if err != nil {
		return *new(bool), err
	}
	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)
	return out0, err
}

// PackInitialize is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xf399e22e.
//
// Solidity: function initialize(address admin, string baseURI_) returns()
func (template *Template) PackInitialize(admin common.Address, baseURI string) []byte {
	enc, err := template.abi.Pack("initialize", admin, baseURI)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackIsApprovedForAll is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xe985e9c5.
//
// Solidity: function isApprovedForAll(address owner, address operator) view returns(bool)
func (template *Template) PackIsApprovedForAll(owner common.Address, operator common.Address) []byte {
	enc, err := template.abi.Pack("isApprovedForAll", owner, operator)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackIsApprovedForAll is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0xe985e9c5.
//
// Solidity: function isApprovedForAll(address owner, address operator) view returns(bool)
func (template *Template) UnpackIsApprovedForAll(data []byte) (bool, error) {
	out, err := template.abi.Unpack("isApprovedForAll", data)
	if err != nil {
		return *new(bool), err
	}
	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)
	return out0, err
}

// PackIsTemplateActive is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xe0a0d933.
//
// Solidity: function isTemplateActive(uint256 templateId) view returns(bool isActive)
func (template *Template) PackIsTemplateActive(templateId *big.Int) []byte {
	enc, err := template.abi.Pack("isTemplateActive", templateId)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackIsTemplateActive is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0xe0a0d933.
//
// Solidity: function isTemplateActive(uint256 templateId) view returns(bool isActive)
func (template *Template) UnpackIsTemplateActive(data []byte) (bool, error) {
	out, err := template.abi.Unpack("isTemplateActive", data)
	if err != nil {
		return *new(bool), err
	}
	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)
	return out0, err
}

// PackName is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (template *Template) PackName() []byte {
	enc, err := template.abi.Pack("name")
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackName is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (template *Template) UnpackName(data []byte) (string, error) {
	out, err := template.abi.Unpack("name", data)
	if err != nil {
		return *new(string), err
	}
	out0 := *abi.ConvertType(out[0], new(string)).(*string)
	return out0, err
}

// PackOwnerOf is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x6352211e.
//
// Solidity: function ownerOf(uint256 tokenId) view returns(address)
func (template *Template) PackOwnerOf(tokenId *big.Int) []byte {
	enc, err := template.abi.Pack("ownerOf", tokenId)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackOwnerOf is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x6352211e.
//
// Solidity: function ownerOf(uint256 tokenId) view returns(address)
func (template *Template) UnpackOwnerOf(data []byte) (common.Address, error) {
	out, err := template.abi.Unpack("ownerOf", data)
	if err != nil {
		return *new(common.Address), err
	}
	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)
	return out0, err
}

// PackProxiableUUID is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x52d1902d.
//
// Solidity: function proxiableUUID() view returns(bytes32)
func (template *Template) PackProxiableUUID() []byte {
	enc, err := template.abi.Pack("proxiableUUID")
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackProxiableUUID is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x52d1902d.
//
// Solidity: function proxiableUUID() view returns(bytes32)
func (template *Template) UnpackProxiableUUID(data []byte) ([32]byte, error) {
	out, err := template.abi.Unpack("proxiableUUID", data)
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
func (template *Template) PackRenounceRole(role [32]byte, callerConfirmation common.Address) []byte {
	enc, err := template.abi.Pack("renounceRole", role, callerConfirmation)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackRevokeRole is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xd547741f.
//
// Solidity: function revokeRole(bytes32 role, address account) returns()
func (template *Template) PackRevokeRole(role [32]byte, account common.Address) []byte {
	enc, err := template.abi.Pack("revokeRole", role, account)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackSafeTransferFrom is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x42842e0e.
//
// Solidity: function safeTransferFrom(address from, address to, uint256 tokenId) returns()
func (template *Template) PackSafeTransferFrom(from common.Address, to common.Address, tokenId *big.Int) []byte {
	enc, err := template.abi.Pack("safeTransferFrom", from, to, tokenId)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackSafeTransferFrom0 is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xb88d4fde.
//
// Solidity: function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) returns()
func (template *Template) PackSafeTransferFrom0(from common.Address, to common.Address, tokenId *big.Int, data []byte) []byte {
	enc, err := template.abi.Pack("safeTransferFrom0", from, to, tokenId, data)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackSetApprovalForAll is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xa22cb465.
//
// Solidity: function setApprovalForAll(address operator, bool approved) returns()
func (template *Template) PackSetApprovalForAll(operator common.Address, approved bool) []byte {
	enc, err := template.abi.Pack("setApprovalForAll", operator, approved)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackSupportsInterface is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (template *Template) PackSupportsInterface(interfaceId [4]byte) []byte {
	enc, err := template.abi.Pack("supportsInterface", interfaceId)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackSupportsInterface is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (template *Template) UnpackSupportsInterface(data []byte) (bool, error) {
	out, err := template.abi.Unpack("supportsInterface", data)
	if err != nil {
		return *new(bool), err
	}
	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)
	return out0, err
}

// PackSymbol is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (template *Template) PackSymbol() []byte {
	enc, err := template.abi.Pack("symbol")
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackSymbol is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (template *Template) UnpackSymbol(data []byte) (string, error) {
	out, err := template.abi.Unpack("symbol", data)
	if err != nil {
		return *new(string), err
	}
	out0 := *abi.ConvertType(out[0], new(string)).(*string)
	return out0, err
}

// PackTemplates is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xbc525652.
//
// Solidity: function templates(uint256 templateId) view returns((address,uint256,string,bool) templateData)
func (template *Template) PackTemplates(templateId *big.Int) []byte {
	enc, err := template.abi.Pack("templates", templateId)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackTemplates is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0xbc525652.
//
// Solidity: function templates(uint256 templateId) view returns((address,uint256,string,bool) templateData)
func (template *Template) UnpackTemplates(data []byte) (ITemplateTemplateData, error) {
	out, err := template.abi.Unpack("templates", data)
	if err != nil {
		return *new(ITemplateTemplateData), err
	}
	out0 := *abi.ConvertType(out[0], new(ITemplateTemplateData)).(*ITemplateTemplateData)
	return out0, err
}

// PackTokenURI is the Go binding used to pack the parameters required for calling
// the contract method with ID 0xc87b56dd.
//
// Solidity: function tokenURI(uint256 tokenId) view returns(string)
func (template *Template) PackTokenURI(tokenId *big.Int) []byte {
	enc, err := template.abi.Pack("tokenURI", tokenId)
	if err != nil {
		panic(err)
	}
	return enc
}

// UnpackTokenURI is the Go binding that unpacks the parameters returned
// from invoking the contract method with ID 0xc87b56dd.
//
// Solidity: function tokenURI(uint256 tokenId) view returns(string)
func (template *Template) UnpackTokenURI(data []byte) (string, error) {
	out, err := template.abi.Unpack("tokenURI", data)
	if err != nil {
		return *new(string), err
	}
	out0 := *abi.ConvertType(out[0], new(string)).(*string)
	return out0, err
}

// PackTransferFrom is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x23b872dd.
//
// Solidity: function transferFrom(address from, address to, uint256 tokenId) returns()
func (template *Template) PackTransferFrom(from common.Address, to common.Address, tokenId *big.Int) []byte {
	enc, err := template.abi.Pack("transferFrom", from, to, tokenId)
	if err != nil {
		panic(err)
	}
	return enc
}

// PackUpgradeToAndCall is the Go binding used to pack the parameters required for calling
// the contract method with ID 0x4f1ef286.
//
// Solidity: function upgradeToAndCall(address newImplementation, bytes data) payable returns()
func (template *Template) PackUpgradeToAndCall(newImplementation common.Address, data []byte) []byte {
	enc, err := template.abi.Pack("upgradeToAndCall", newImplementation, data)
	if err != nil {
		panic(err)
	}
	return enc
}

// TemplateApproval represents a Approval event raised by the Template contract.
type TemplateApproval struct {
	Owner    common.Address
	Approved common.Address
	TokenId  *big.Int
	Raw      *types.Log // Blockchain specific contextual infos
}

const TemplateApprovalEventName = "Approval"

// ContractEventName returns the user-defined event name.
func (TemplateApproval) ContractEventName() string {
	return TemplateApprovalEventName
}

// UnpackApprovalEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
func (template *Template) UnpackApprovalEvent(log *types.Log) (*TemplateApproval, error) {
	event := "Approval"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateApproval)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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

// TemplateApprovalForAll represents a ApprovalForAll event raised by the Template contract.
type TemplateApprovalForAll struct {
	Owner    common.Address
	Operator common.Address
	Approved bool
	Raw      *types.Log // Blockchain specific contextual infos
}

const TemplateApprovalForAllEventName = "ApprovalForAll"

// ContractEventName returns the user-defined event name.
func (TemplateApprovalForAll) ContractEventName() string {
	return TemplateApprovalForAllEventName
}

// UnpackApprovalForAllEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
func (template *Template) UnpackApprovalForAllEvent(log *types.Log) (*TemplateApprovalForAll, error) {
	event := "ApprovalForAll"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateApprovalForAll)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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

// TemplateInitialized represents a Initialized event raised by the Template contract.
type TemplateInitialized struct {
	Version uint64
	Raw     *types.Log // Blockchain specific contextual infos
}

const TemplateInitializedEventName = "Initialized"

// ContractEventName returns the user-defined event name.
func (TemplateInitialized) ContractEventName() string {
	return TemplateInitializedEventName
}

// UnpackInitializedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event Initialized(uint64 version)
func (template *Template) UnpackInitializedEvent(log *types.Log) (*TemplateInitialized, error) {
	event := "Initialized"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateInitialized)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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

// TemplateRoleAdminChanged represents a RoleAdminChanged event raised by the Template contract.
type TemplateRoleAdminChanged struct {
	Role              [32]byte
	PreviousAdminRole [32]byte
	NewAdminRole      [32]byte
	Raw               *types.Log // Blockchain specific contextual infos
}

const TemplateRoleAdminChangedEventName = "RoleAdminChanged"

// ContractEventName returns the user-defined event name.
func (TemplateRoleAdminChanged) ContractEventName() string {
	return TemplateRoleAdminChangedEventName
}

// UnpackRoleAdminChangedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
func (template *Template) UnpackRoleAdminChangedEvent(log *types.Log) (*TemplateRoleAdminChanged, error) {
	event := "RoleAdminChanged"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateRoleAdminChanged)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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

// TemplateRoleGranted represents a RoleGranted event raised by the Template contract.
type TemplateRoleGranted struct {
	Role    [32]byte
	Account common.Address
	Sender  common.Address
	Raw     *types.Log // Blockchain specific contextual infos
}

const TemplateRoleGrantedEventName = "RoleGranted"

// ContractEventName returns the user-defined event name.
func (TemplateRoleGranted) ContractEventName() string {
	return TemplateRoleGrantedEventName
}

// UnpackRoleGrantedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
func (template *Template) UnpackRoleGrantedEvent(log *types.Log) (*TemplateRoleGranted, error) {
	event := "RoleGranted"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateRoleGranted)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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

// TemplateRoleRevoked represents a RoleRevoked event raised by the Template contract.
type TemplateRoleRevoked struct {
	Role    [32]byte
	Account common.Address
	Sender  common.Address
	Raw     *types.Log // Blockchain specific contextual infos
}

const TemplateRoleRevokedEventName = "RoleRevoked"

// ContractEventName returns the user-defined event name.
func (TemplateRoleRevoked) ContractEventName() string {
	return TemplateRoleRevokedEventName
}

// UnpackRoleRevokedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
func (template *Template) UnpackRoleRevokedEvent(log *types.Log) (*TemplateRoleRevoked, error) {
	event := "RoleRevoked"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateRoleRevoked)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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

// TemplateTemplateActivated represents a TemplateActivated event raised by the Template contract.
type TemplateTemplateActivated struct {
	TemplateId *big.Int
	Raw        *types.Log // Blockchain specific contextual infos
}

const TemplateTemplateActivatedEventName = "TemplateActivated"

// ContractEventName returns the user-defined event name.
func (TemplateTemplateActivated) ContractEventName() string {
	return TemplateTemplateActivatedEventName
}

// UnpackTemplateActivatedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event TemplateActivated(uint256 indexed templateId)
func (template *Template) UnpackTemplateActivatedEvent(log *types.Log) (*TemplateTemplateActivated, error) {
	event := "TemplateActivated"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateTemplateActivated)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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

// TemplateTemplateCreated represents a TemplateCreated event raised by the Template contract.
type TemplateTemplateCreated struct {
	TemplateId  *big.Int
	Creator     common.Address
	Asset       common.Address
	Permissions *big.Int
	Cid         string
	Raw         *types.Log // Blockchain specific contextual infos
}

const TemplateTemplateCreatedEventName = "TemplateCreated"

// ContractEventName returns the user-defined event name.
func (TemplateTemplateCreated) ContractEventName() string {
	return TemplateTemplateCreatedEventName
}

// UnpackTemplateCreatedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event TemplateCreated(uint256 indexed templateId, address indexed creator, address indexed asset, uint256 permissions, string cid)
func (template *Template) UnpackTemplateCreatedEvent(log *types.Log) (*TemplateTemplateCreated, error) {
	event := "TemplateCreated"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateTemplateCreated)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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

// TemplateTemplateDeactivated represents a TemplateDeactivated event raised by the Template contract.
type TemplateTemplateDeactivated struct {
	TemplateId *big.Int
	Raw        *types.Log // Blockchain specific contextual infos
}

const TemplateTemplateDeactivatedEventName = "TemplateDeactivated"

// ContractEventName returns the user-defined event name.
func (TemplateTemplateDeactivated) ContractEventName() string {
	return TemplateTemplateDeactivatedEventName
}

// UnpackTemplateDeactivatedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event TemplateDeactivated(uint256 indexed templateId)
func (template *Template) UnpackTemplateDeactivatedEvent(log *types.Log) (*TemplateTemplateDeactivated, error) {
	event := "TemplateDeactivated"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateTemplateDeactivated)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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

// TemplateTransfer represents a Transfer event raised by the Template contract.
type TemplateTransfer struct {
	From    common.Address
	To      common.Address
	TokenId *big.Int
	Raw     *types.Log // Blockchain specific contextual infos
}

const TemplateTransferEventName = "Transfer"

// ContractEventName returns the user-defined event name.
func (TemplateTransfer) ContractEventName() string {
	return TemplateTransferEventName
}

// UnpackTransferEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
func (template *Template) UnpackTransferEvent(log *types.Log) (*TemplateTransfer, error) {
	event := "Transfer"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateTransfer)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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

// TemplateUpgraded represents a Upgraded event raised by the Template contract.
type TemplateUpgraded struct {
	Implementation common.Address
	Raw            *types.Log // Blockchain specific contextual infos
}

const TemplateUpgradedEventName = "Upgraded"

// ContractEventName returns the user-defined event name.
func (TemplateUpgraded) ContractEventName() string {
	return TemplateUpgradedEventName
}

// UnpackUpgradedEvent is the Go binding that unpacks the event data emitted
// by contract.
//
// Solidity: event Upgraded(address indexed implementation)
func (template *Template) UnpackUpgradedEvent(log *types.Log) (*TemplateUpgraded, error) {
	event := "Upgraded"
	if log.Topics[0] != template.abi.Events[event].ID {
		return nil, errors.New("event signature mismatch")
	}
	out := new(TemplateUpgraded)
	if len(log.Data) > 0 {
		if err := template.abi.UnpackIntoInterface(out, event, log.Data); err != nil {
			return nil, err
		}
	}
	var indexed abi.Arguments
	for _, arg := range template.abi.Events[event].Inputs {
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
func (template *Template) UnpackError(raw []byte) (any, error) {
	if bytes.Equal(raw[:4], template.abi.Errors["AccessControlBadConfirmation"].ID.Bytes()[:4]) {
		return template.UnpackAccessControlBadConfirmationError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["AccessControlUnauthorizedAccount"].ID.Bytes()[:4]) {
		return template.UnpackAccessControlUnauthorizedAccountError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["AddressEmptyCode"].ID.Bytes()[:4]) {
		return template.UnpackAddressEmptyCodeError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["ERC1967InvalidImplementation"].ID.Bytes()[:4]) {
		return template.UnpackERC1967InvalidImplementationError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["ERC1967NonPayable"].ID.Bytes()[:4]) {
		return template.UnpackERC1967NonPayableError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["ERC721IncorrectOwner"].ID.Bytes()[:4]) {
		return template.UnpackERC721IncorrectOwnerError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["ERC721InsufficientApproval"].ID.Bytes()[:4]) {
		return template.UnpackERC721InsufficientApprovalError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["ERC721InvalidApprover"].ID.Bytes()[:4]) {
		return template.UnpackERC721InvalidApproverError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["ERC721InvalidOperator"].ID.Bytes()[:4]) {
		return template.UnpackERC721InvalidOperatorError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["ERC721InvalidOwner"].ID.Bytes()[:4]) {
		return template.UnpackERC721InvalidOwnerError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["ERC721InvalidReceiver"].ID.Bytes()[:4]) {
		return template.UnpackERC721InvalidReceiverError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["ERC721InvalidSender"].ID.Bytes()[:4]) {
		return template.UnpackERC721InvalidSenderError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["ERC721NonexistentToken"].ID.Bytes()[:4]) {
		return template.UnpackERC721NonexistentTokenError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["FailedInnerCall"].ID.Bytes()[:4]) {
		return template.UnpackFailedInnerCallError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["InvalidInitialization"].ID.Bytes()[:4]) {
		return template.UnpackInvalidInitializationError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["InvalidTemplateData"].ID.Bytes()[:4]) {
		return template.UnpackInvalidTemplateDataError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["NotInitializing"].ID.Bytes()[:4]) {
		return template.UnpackNotInitializingError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["TemplateAlreadyActivated"].ID.Bytes()[:4]) {
		return template.UnpackTemplateAlreadyActivatedError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["TemplateAlreadyDeactivated"].ID.Bytes()[:4]) {
		return template.UnpackTemplateAlreadyDeactivatedError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["TemplateAlreadyExists"].ID.Bytes()[:4]) {
		return template.UnpackTemplateAlreadyExistsError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["TemplateNotFound"].ID.Bytes()[:4]) {
		return template.UnpackTemplateNotFoundError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["UUPSUnauthorizedCallContext"].ID.Bytes()[:4]) {
		return template.UnpackUUPSUnauthorizedCallContextError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["UUPSUnsupportedProxiableUUID"].ID.Bytes()[:4]) {
		return template.UnpackUUPSUnsupportedProxiableUUIDError(raw[4:])
	}
	if bytes.Equal(raw[:4], template.abi.Errors["Unauthorized"].ID.Bytes()[:4]) {
		return template.UnpackUnauthorizedError(raw[4:])
	}
	return nil, errors.New("Unknown error")
}

// TemplateAccessControlBadConfirmation represents a AccessControlBadConfirmation error raised by the Template contract.
type TemplateAccessControlBadConfirmation struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error AccessControlBadConfirmation()
func TemplateAccessControlBadConfirmationErrorID() common.Hash {
	return common.HexToHash("0x6697b23232a647058342c0724fe7c415cab25915b54e5dbc03f233173d37b41c")
}

// UnpackAccessControlBadConfirmationError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error AccessControlBadConfirmation()
func (template *Template) UnpackAccessControlBadConfirmationError(raw []byte) (*TemplateAccessControlBadConfirmation, error) {
	out := new(TemplateAccessControlBadConfirmation)
	if err := template.abi.UnpackIntoInterface(out, "AccessControlBadConfirmation", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateAccessControlUnauthorizedAccount represents a AccessControlUnauthorizedAccount error raised by the Template contract.
type TemplateAccessControlUnauthorizedAccount struct {
	Account    common.Address
	NeededRole [32]byte
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)
func TemplateAccessControlUnauthorizedAccountErrorID() common.Hash {
	return common.HexToHash("0xe2517d3fbfae6f8515ef5ff1ccedc3933ab0cbbda0b492c06eb54ad10ef03b3e")
}

// UnpackAccessControlUnauthorizedAccountError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)
func (template *Template) UnpackAccessControlUnauthorizedAccountError(raw []byte) (*TemplateAccessControlUnauthorizedAccount, error) {
	out := new(TemplateAccessControlUnauthorizedAccount)
	if err := template.abi.UnpackIntoInterface(out, "AccessControlUnauthorizedAccount", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateAddressEmptyCode represents a AddressEmptyCode error raised by the Template contract.
type TemplateAddressEmptyCode struct {
	Target common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error AddressEmptyCode(address target)
func TemplateAddressEmptyCodeErrorID() common.Hash {
	return common.HexToHash("0x9996b315c842ff135b8fc4a08ad5df1c344efbc03d2687aecc0678050d2aac89")
}

// UnpackAddressEmptyCodeError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error AddressEmptyCode(address target)
func (template *Template) UnpackAddressEmptyCodeError(raw []byte) (*TemplateAddressEmptyCode, error) {
	out := new(TemplateAddressEmptyCode)
	if err := template.abi.UnpackIntoInterface(out, "AddressEmptyCode", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateERC1967InvalidImplementation represents a ERC1967InvalidImplementation error raised by the Template contract.
type TemplateERC1967InvalidImplementation struct {
	Implementation common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC1967InvalidImplementation(address implementation)
func TemplateERC1967InvalidImplementationErrorID() common.Hash {
	return common.HexToHash("0x4c9c8ce3ceb3130f17f7cdba48d89b5b0129f266a8bac114e6e315a41879b617")
}

// UnpackERC1967InvalidImplementationError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC1967InvalidImplementation(address implementation)
func (template *Template) UnpackERC1967InvalidImplementationError(raw []byte) (*TemplateERC1967InvalidImplementation, error) {
	out := new(TemplateERC1967InvalidImplementation)
	if err := template.abi.UnpackIntoInterface(out, "ERC1967InvalidImplementation", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateERC1967NonPayable represents a ERC1967NonPayable error raised by the Template contract.
type TemplateERC1967NonPayable struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC1967NonPayable()
func TemplateERC1967NonPayableErrorID() common.Hash {
	return common.HexToHash("0xb398979fa84f543c8e222f17890372c487baf85e062276c127fef521eea7224b")
}

// UnpackERC1967NonPayableError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC1967NonPayable()
func (template *Template) UnpackERC1967NonPayableError(raw []byte) (*TemplateERC1967NonPayable, error) {
	out := new(TemplateERC1967NonPayable)
	if err := template.abi.UnpackIntoInterface(out, "ERC1967NonPayable", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateERC721IncorrectOwner represents a ERC721IncorrectOwner error raised by the Template contract.
type TemplateERC721IncorrectOwner struct {
	Sender  common.Address
	TokenId *big.Int
	Owner   common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner)
func TemplateERC721IncorrectOwnerErrorID() common.Hash {
	return common.HexToHash("0x64283d7b313c8117c125f736876fa2b4e90ea3831a4716dfdb87d2f540e26289")
}

// UnpackERC721IncorrectOwnerError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner)
func (template *Template) UnpackERC721IncorrectOwnerError(raw []byte) (*TemplateERC721IncorrectOwner, error) {
	out := new(TemplateERC721IncorrectOwner)
	if err := template.abi.UnpackIntoInterface(out, "ERC721IncorrectOwner", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateERC721InsufficientApproval represents a ERC721InsufficientApproval error raised by the Template contract.
type TemplateERC721InsufficientApproval struct {
	Operator common.Address
	TokenId  *big.Int
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC721InsufficientApproval(address operator, uint256 tokenId)
func TemplateERC721InsufficientApprovalErrorID() common.Hash {
	return common.HexToHash("0x177e802f6f313bc89797ecace66d6d29ab4719cbaaacbb87367264048b1eb861")
}

// UnpackERC721InsufficientApprovalError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC721InsufficientApproval(address operator, uint256 tokenId)
func (template *Template) UnpackERC721InsufficientApprovalError(raw []byte) (*TemplateERC721InsufficientApproval, error) {
	out := new(TemplateERC721InsufficientApproval)
	if err := template.abi.UnpackIntoInterface(out, "ERC721InsufficientApproval", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateERC721InvalidApprover represents a ERC721InvalidApprover error raised by the Template contract.
type TemplateERC721InvalidApprover struct {
	Approver common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC721InvalidApprover(address approver)
func TemplateERC721InvalidApproverErrorID() common.Hash {
	return common.HexToHash("0xa9fbf51f86b8e03595d59dc726bb10c329bb24f62589be276d8dd193ca0b69ea")
}

// UnpackERC721InvalidApproverError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC721InvalidApprover(address approver)
func (template *Template) UnpackERC721InvalidApproverError(raw []byte) (*TemplateERC721InvalidApprover, error) {
	out := new(TemplateERC721InvalidApprover)
	if err := template.abi.UnpackIntoInterface(out, "ERC721InvalidApprover", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateERC721InvalidOperator represents a ERC721InvalidOperator error raised by the Template contract.
type TemplateERC721InvalidOperator struct {
	Operator common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC721InvalidOperator(address operator)
func TemplateERC721InvalidOperatorErrorID() common.Hash {
	return common.HexToHash("0x5b08ba185e8f577075361f3a3555a6580a227ce22734dcc979c1aeadf894658b")
}

// UnpackERC721InvalidOperatorError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC721InvalidOperator(address operator)
func (template *Template) UnpackERC721InvalidOperatorError(raw []byte) (*TemplateERC721InvalidOperator, error) {
	out := new(TemplateERC721InvalidOperator)
	if err := template.abi.UnpackIntoInterface(out, "ERC721InvalidOperator", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateERC721InvalidOwner represents a ERC721InvalidOwner error raised by the Template contract.
type TemplateERC721InvalidOwner struct {
	Owner common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC721InvalidOwner(address owner)
func TemplateERC721InvalidOwnerErrorID() common.Hash {
	return common.HexToHash("0x89c62b6479af2e623826dcc39c5133061d35b66d72de92833401dd2fd6567480")
}

// UnpackERC721InvalidOwnerError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC721InvalidOwner(address owner)
func (template *Template) UnpackERC721InvalidOwnerError(raw []byte) (*TemplateERC721InvalidOwner, error) {
	out := new(TemplateERC721InvalidOwner)
	if err := template.abi.UnpackIntoInterface(out, "ERC721InvalidOwner", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateERC721InvalidReceiver represents a ERC721InvalidReceiver error raised by the Template contract.
type TemplateERC721InvalidReceiver struct {
	Receiver common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC721InvalidReceiver(address receiver)
func TemplateERC721InvalidReceiverErrorID() common.Hash {
	return common.HexToHash("0x64a0ae9278f805eaf991dcd18ca78756d280b7508b764ef1b255c55845c11df9")
}

// UnpackERC721InvalidReceiverError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC721InvalidReceiver(address receiver)
func (template *Template) UnpackERC721InvalidReceiverError(raw []byte) (*TemplateERC721InvalidReceiver, error) {
	out := new(TemplateERC721InvalidReceiver)
	if err := template.abi.UnpackIntoInterface(out, "ERC721InvalidReceiver", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateERC721InvalidSender represents a ERC721InvalidSender error raised by the Template contract.
type TemplateERC721InvalidSender struct {
	Sender common.Address
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC721InvalidSender(address sender)
func TemplateERC721InvalidSenderErrorID() common.Hash {
	return common.HexToHash("0x73c6ac6e10798e95d99e1f130d923eb40193ecb8d094ec3dce93292564eb3b17")
}

// UnpackERC721InvalidSenderError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC721InvalidSender(address sender)
func (template *Template) UnpackERC721InvalidSenderError(raw []byte) (*TemplateERC721InvalidSender, error) {
	out := new(TemplateERC721InvalidSender)
	if err := template.abi.UnpackIntoInterface(out, "ERC721InvalidSender", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateERC721NonexistentToken represents a ERC721NonexistentToken error raised by the Template contract.
type TemplateERC721NonexistentToken struct {
	TokenId *big.Int
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error ERC721NonexistentToken(uint256 tokenId)
func TemplateERC721NonexistentTokenErrorID() common.Hash {
	return common.HexToHash("0x7e273289a3a9ef6670f06df7dca227856fc925e956db96980692764a8bc734d7")
}

// UnpackERC721NonexistentTokenError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error ERC721NonexistentToken(uint256 tokenId)
func (template *Template) UnpackERC721NonexistentTokenError(raw []byte) (*TemplateERC721NonexistentToken, error) {
	out := new(TemplateERC721NonexistentToken)
	if err := template.abi.UnpackIntoInterface(out, "ERC721NonexistentToken", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateFailedInnerCall represents a FailedInnerCall error raised by the Template contract.
type TemplateFailedInnerCall struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error FailedInnerCall()
func TemplateFailedInnerCallErrorID() common.Hash {
	return common.HexToHash("0x1425ea42df7c932537f94e8b917ea9c5931f140fb6e8098822ef05dc56222ca9")
}

// UnpackFailedInnerCallError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error FailedInnerCall()
func (template *Template) UnpackFailedInnerCallError(raw []byte) (*TemplateFailedInnerCall, error) {
	out := new(TemplateFailedInnerCall)
	if err := template.abi.UnpackIntoInterface(out, "FailedInnerCall", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateInvalidInitialization represents a InvalidInitialization error raised by the Template contract.
type TemplateInvalidInitialization struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error InvalidInitialization()
func TemplateInvalidInitializationErrorID() common.Hash {
	return common.HexToHash("0xf92ee8a957075833165f68c320933b1a1294aafc84ee6e0dd3fb178008f9aaf5")
}

// UnpackInvalidInitializationError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error InvalidInitialization()
func (template *Template) UnpackInvalidInitializationError(raw []byte) (*TemplateInvalidInitialization, error) {
	out := new(TemplateInvalidInitialization)
	if err := template.abi.UnpackIntoInterface(out, "InvalidInitialization", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateInvalidTemplateData represents a InvalidTemplateData error raised by the Template contract.
type TemplateInvalidTemplateData struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error InvalidTemplateData()
func TemplateInvalidTemplateDataErrorID() common.Hash {
	return common.HexToHash("0x108503e8bc634f24a363dadf26017113abdb2f4d054aa520e573450df9b8bf05")
}

// UnpackInvalidTemplateDataError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error InvalidTemplateData()
func (template *Template) UnpackInvalidTemplateDataError(raw []byte) (*TemplateInvalidTemplateData, error) {
	out := new(TemplateInvalidTemplateData)
	if err := template.abi.UnpackIntoInterface(out, "InvalidTemplateData", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateNotInitializing represents a NotInitializing error raised by the Template contract.
type TemplateNotInitializing struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error NotInitializing()
func TemplateNotInitializingErrorID() common.Hash {
	return common.HexToHash("0xd7e6bcf8597daa127dc9f0048d2f08d5ef140a2cb659feabd700beff1f7a8302")
}

// UnpackNotInitializingError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error NotInitializing()
func (template *Template) UnpackNotInitializingError(raw []byte) (*TemplateNotInitializing, error) {
	out := new(TemplateNotInitializing)
	if err := template.abi.UnpackIntoInterface(out, "NotInitializing", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateTemplateAlreadyActivated represents a TemplateAlreadyActivated error raised by the Template contract.
type TemplateTemplateAlreadyActivated struct {
	TemplateId *big.Int
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error TemplateAlreadyActivated(uint256 templateId)
func TemplateTemplateAlreadyActivatedErrorID() common.Hash {
	return common.HexToHash("0x7b9a98ab97fcdf471d4c4c185d8a9855a355141d99f1e4bc2e49fd4eb231db9f")
}

// UnpackTemplateAlreadyActivatedError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error TemplateAlreadyActivated(uint256 templateId)
func (template *Template) UnpackTemplateAlreadyActivatedError(raw []byte) (*TemplateTemplateAlreadyActivated, error) {
	out := new(TemplateTemplateAlreadyActivated)
	if err := template.abi.UnpackIntoInterface(out, "TemplateAlreadyActivated", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateTemplateAlreadyDeactivated represents a TemplateAlreadyDeactivated error raised by the Template contract.
type TemplateTemplateAlreadyDeactivated struct {
	TemplateId *big.Int
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error TemplateAlreadyDeactivated(uint256 templateId)
func TemplateTemplateAlreadyDeactivatedErrorID() common.Hash {
	return common.HexToHash("0x0217ac545294be1f8321612c0c8546f99bd437cae7561714efd6839b5e75b232")
}

// UnpackTemplateAlreadyDeactivatedError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error TemplateAlreadyDeactivated(uint256 templateId)
func (template *Template) UnpackTemplateAlreadyDeactivatedError(raw []byte) (*TemplateTemplateAlreadyDeactivated, error) {
	out := new(TemplateTemplateAlreadyDeactivated)
	if err := template.abi.UnpackIntoInterface(out, "TemplateAlreadyDeactivated", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateTemplateAlreadyExists represents a TemplateAlreadyExists error raised by the Template contract.
type TemplateTemplateAlreadyExists struct {
	TemplateId *big.Int
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error TemplateAlreadyExists(uint256 templateId)
func TemplateTemplateAlreadyExistsErrorID() common.Hash {
	return common.HexToHash("0x9282d58fb5fd12777e0d3c13125f112b366e8f224bff91bb927ad20cb4f5c4d7")
}

// UnpackTemplateAlreadyExistsError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error TemplateAlreadyExists(uint256 templateId)
func (template *Template) UnpackTemplateAlreadyExistsError(raw []byte) (*TemplateTemplateAlreadyExists, error) {
	out := new(TemplateTemplateAlreadyExists)
	if err := template.abi.UnpackIntoInterface(out, "TemplateAlreadyExists", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateTemplateNotFound represents a TemplateNotFound error raised by the Template contract.
type TemplateTemplateNotFound struct {
	TemplateId *big.Int
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error TemplateNotFound(uint256 templateId)
func TemplateTemplateNotFoundErrorID() common.Hash {
	return common.HexToHash("0x575e741ea1e1c0df7deb4ab9626b73cda01c9fa11263cdc1da8ba1ec35ce50ff")
}

// UnpackTemplateNotFoundError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error TemplateNotFound(uint256 templateId)
func (template *Template) UnpackTemplateNotFoundError(raw []byte) (*TemplateTemplateNotFound, error) {
	out := new(TemplateTemplateNotFound)
	if err := template.abi.UnpackIntoInterface(out, "TemplateNotFound", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateUUPSUnauthorizedCallContext represents a UUPSUnauthorizedCallContext error raised by the Template contract.
type TemplateUUPSUnauthorizedCallContext struct {
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error UUPSUnauthorizedCallContext()
func TemplateUUPSUnauthorizedCallContextErrorID() common.Hash {
	return common.HexToHash("0xe07c8dba242a06571ac65fe4bbe20522c9fb111cb33599b799ff8039c1ed18f4")
}

// UnpackUUPSUnauthorizedCallContextError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error UUPSUnauthorizedCallContext()
func (template *Template) UnpackUUPSUnauthorizedCallContextError(raw []byte) (*TemplateUUPSUnauthorizedCallContext, error) {
	out := new(TemplateUUPSUnauthorizedCallContext)
	if err := template.abi.UnpackIntoInterface(out, "UUPSUnauthorizedCallContext", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateUUPSUnsupportedProxiableUUID represents a UUPSUnsupportedProxiableUUID error raised by the Template contract.
type TemplateUUPSUnsupportedProxiableUUID struct {
	Slot [32]byte
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error UUPSUnsupportedProxiableUUID(bytes32 slot)
func TemplateUUPSUnsupportedProxiableUUIDErrorID() common.Hash {
	return common.HexToHash("0xaa1d49a4c084bfa9aeeee2a0be65267a7f19ba7e1476b114dac513d2c14cb563")
}

// UnpackUUPSUnsupportedProxiableUUIDError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error UUPSUnsupportedProxiableUUID(bytes32 slot)
func (template *Template) UnpackUUPSUnsupportedProxiableUUIDError(raw []byte) (*TemplateUUPSUnsupportedProxiableUUID, error) {
	out := new(TemplateUUPSUnsupportedProxiableUUID)
	if err := template.abi.UnpackIntoInterface(out, "UUPSUnsupportedProxiableUUID", raw); err != nil {
		return nil, err
	}
	return out, nil
}

// TemplateUnauthorized represents a Unauthorized error raised by the Template contract.
type TemplateUnauthorized struct {
	Caller     common.Address
	TemplateId *big.Int
}

// ErrorID returns the hash of canonical representation of the error's signature.
//
// Solidity: error Unauthorized(address caller, uint256 templateId)
func TemplateUnauthorizedErrorID() common.Hash {
	return common.HexToHash("0xda472023f86311d15656b0c3a4dc0fd2964e31c9956d6be74926e58311c995dc")
}

// UnpackUnauthorizedError is the Go binding used to decode the provided
// error data into the corresponding Go error struct.
//
// Solidity: error Unauthorized(address caller, uint256 templateId)
func (template *Template) UnpackUnauthorizedError(raw []byte) (*TemplateUnauthorized, error) {
	out := new(TemplateUnauthorized)
	if err := template.abi.UnpackIntoInterface(out, "Unauthorized", raw); err != nil {
		return nil, err
	}
	return out, nil
}
