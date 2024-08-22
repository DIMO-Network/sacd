# sacd

## Deploy

```
npx hardhat ignition deploy ./ignition/modules/Sacd.ts --network <network>
```

## Verification

```
npx hardhat ignition deployments
```

output
```
chain-31337
chain-80002
chain-137
```

```
npx hardhat ignition verify chain-<id>
```