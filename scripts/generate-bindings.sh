#!/bin/bash

# Check if abigen is installed
if ! command -v abigen &> /dev/null
then
    echo "⚠️  abigen not found, skipping Go bindings generation"
    echo "To generate Go bindings, install abigen: https://geth.ethereum.org/docs/tools/abigen"
    exit 0
fi

echo "Generating Go bindings..."

# Create bindings directory if it doesn't exist
mkdir -p bindings

abigen --abi abis/contracts/Sacd.sol/Sacd.json --out bindings/sacd.go --pkg sacd --type Sacd --v2
abigen --abi abis/contracts/Template.sol/Template.json --out bindings/template.go --pkg template --type Template --v2

echo "✅ Go bindings generated successfully in bindings/"