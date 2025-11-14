# Besu Private Blockchain Network

## System Architecture

This project sets up a private Ethereum-compatible blockchain network using Hyperledger Besu with QBFT (Quorum Byzantine Fault Tolerance) consensus. The architecture consists of:

- **4 Besu Nodes**: Each running in a Docker container, configured for P2P networking and RPC APIs.
- **Docker Compose Orchestration**: Manages containerized nodes with shared volumes for genesis file, private keys, and blockchain data.
- **Network Configuration**: Custom bridge network (172.20.0.0/16) for inter-node communication.
- **Consensus Mechanism**: QBFT with 2-second block periods, 30,000 epoch length, and 4-second request timeouts.
- **Data Persistence**: Volumes for node-specific data, keys, and databases.

## Functionalities

- **Blockchain Operations**: Genesis block initialization with predefined allocations and chain ID 1337.
- **Node Discovery**: Bootnode-based P2P discovery for network formation.
- **API Access**: RPC HTTP endpoints (ports 8545-8548) exposing ETH, NET, and QBFT APIs for blockchain interaction.
- **Consensus**: Fault-tolerant block production and validation across nodes.
- **Enterprise Profile**: Optimized for enterprise use with allowlisted hosts and CORS support.

## Potential Errors and Overloads

The main resources prone to overload can be divided into 3 categories:

- **CPU** 
- **Memory**
- **I/O**
- **Gas Limit**

High latency in these can disrupt container operations, leading to consensus failures or container shutdowns. Immediate corrective action is to restart the affected container.

### Effects on Containers and Logs

1. **Transaction Overload**: When a massive sequence of transactions is made to the network, it can be overloaded in two differente ways:
    - ***Gas Limit Saturation***: The network has a gas limit per block (defined in the genesis.json file). If the demand for transactions exceeds what the validators can process within the block mining time, the mempool becomes overloaded and new transactions get slow or rejected. 

    - ***CPU Overload***: Described bellow.

2. **Latency/CPU Overload**:  Logs show "RoundTimer | Moved to round X which will expire in..." messages. The node fails to sign and vote timely, causing continuous consensus failures while remaining operational but ineffective.

3. **Memory Overload (OOM)**: Container is terminated by Docker/Kernel. Docker logs display "OOMKilled" error. Node stops functioning and requires restart.

4. **I/O Overload (Disk)**: Logs show "WARN | RocksDB | Operation timed out". Slow disk writes delay voting, leading to consensus failures similar to latency issues.


## Mitigation with Kubernetes

Kubernetes can manage these issues through auto-healing and resource allocation:

- **Liveness Probe**: Monitors if Besu process is running. Restarts Pod on failure (e.g., OOM or crash).
- **Readiness Probe**: Checks if node is ready for consensus (e.g., RPC/P2P ports active, block number increasing). Marks node as "Not Ready" if slow, temporarily removing it from service.
- **Resource Limits**: Define CPU/memory limits and requests to prevent host overload and ensure minimum resources per node.
- **Cluster Autoscaling**: Adds more cluster nodes if overload persists, providing additional physical resources.

Kubernetes ensures high availability by detecting failures and automatically recovering nodes.
