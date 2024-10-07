# sacd

## Deploy

```
npx hardhat ignition deploy ./ignition/modules/Sacd.ts --network <network>
```

In case of reconciliation failed, you can wipe the `journal.jsonl`. Make sure to use the last `futureId` in the journal.

```
npx hardhat ignition wipe chain-<id> --network futureId
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