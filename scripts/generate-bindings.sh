
#!/bin/bash

# Exit on error
set -e

# Check if abigen is installed
if ! command -v abigen &> /dev/null
then
    echo "⚠️  abigen not found, skipping Go bindings generation"
    echo "To generate Go bindings, install abigen: https://geth.ethereum.org/docs/tools/abigen"
    exit 0
fi

echo "Generating Go bindings..."

# Create directories if they don't exist
mkdir -p bindings/sacd
mkdir -p bindings/template

abigen --abi abis/contracts/Sacd.sol/Sacd.json --out bindings/sacd/sacd.go --pkg sacd --type Sacd --v2
echo "✅ Sacd bindings generated"

abigen --abi abis/contracts/Template.sol/Template.json --out bindings/template/template.go --pkg template --type Template --v2
echo "✅ Template bindings generated"

echo "✅ All Go bindings generated successfully in bindings/"