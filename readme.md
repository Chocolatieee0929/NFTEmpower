### 项目结构

- chain 合约模块
- server 后台服务
- web 前端界面
  pnpm add @nft-bazaar/chain -r -F @nft-bazaar/web

### 功能

- 用户可创建自定义NFT集（工厂合约实现），自定义名字、可 mint 的数量、mint 一个 nft 的价格(eth)、可控制 mint的白名单地址
- nft管理员可销毁，可暂停 mint、可用于投票
- nft 可上架销售，销售使用平台代币 NBT

### 开发

**启动本地区块测试网**
cd onchain && pnpm localnet

**启动前端页面**
cd web && pnpm dev
