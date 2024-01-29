### combine foundry in

npx hardhat init-foundry
forge install

### start a local network

pnpm local-net

### thegraph相关

#### 用subgraph-studio

**初始化**
npx graph init --product subgraph-studio --from-contract 0xa670eAfE57AD3B4468e3172605a16f3de5E42029 --network sepolia --abi ./deployments/sepolia/MyNft.json nft-bazaar ./thegraph

**schema/entity更新后重新生成**

cd ./thegraph
npx graph codegen

**发布部署**

- npx graph auth --studio xxx(your key)
- npx graph codegen && npx graph build
- npx graph deploy --studio xxx(SUBGRAPH_NAME)

**添加合约**

cd ./thegraph
npx graph add 0x869B8E3fF0D30B1f34a9397c95ce4dEc3D76728E --abi ../deployments/sepolia/NftMarket.json --contract-name NftMarket

#### 本地部署 graph-node

1、用 docker 运行 graph-node

- 在本项目目录外 `git clone https://github.com/graphprotocol/graph-node.git`, 进入 docker 目录，修改 `docker-compose.yml`的配置：

`ethereum: 'mainnet:http://host.docker.internal:8545'` 改为：`ethereum: 'localhost:http://host.docker.internal:8545'`

- 在本地运行一个localhost区块网络, 在本项目下 onchain 目录运行：`pnpm run localnet`
- 返回 docker 目录，启动 docker 容器：`docker-compose up`
