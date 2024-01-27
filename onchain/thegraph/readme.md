### 用 docker 运行构建本地 graph 节点供测试

1、 克隆节点库
git clone git@github.com:graphprotocol/graph-node.git

2、 用 docker启动节点

cd ./docker

更改配置 `docker-compose.yaml` 中的以太坊网络
`mainnet:http://host.docker.internal:8545` => `hardhat:http://localhost:8545`
确保本地 hardhat 测试网已经启动，或者用其他网络`<NETWORK_NAME>:<ETHEREUM_RPC_URL>`

然后启动docker： `docker-compose up`

相关文档： https://github.com/graphprotocol/graph-node/tree/master/docker
