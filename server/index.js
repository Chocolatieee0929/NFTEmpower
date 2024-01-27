/**
 * 节点客户端
 */
import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import db from "./db.js";
import nodeEvents from "./nodeEvents.js";
import cors from "@koa/cors";
import Promise from "bluebird";

Promise.promisifyAll(db);

const app = new Koa();
const router = new Router();

app.use(cors());

nodeEvents();

router.get("/api/nfts", async (ctx) => {
  // 从 query 参数获取address的 nft
  const { address } = ctx.query;
  const nfts = await db.findAsync({ owner: address });
  ctx.body = {
    message: "Get nfts successfully",
    data: nfts,
  };
});

/**
 * 获取 请求客户端的ip地址
 */
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  );
}

// 获取完整的区块
router.get("/api/fullchains", async (ctx) => {
  ctx.body = {
    message: "Get full chains successfully",
    data: {
      fullchains: blockchain.chains,
    },
  };
});

// 发送本节点所保存的临近节点
router.get("/api/nodes", async (ctx) => {
  ctx.body = {
    message: "Get nodes successfully",
    data: {
      nodes: blockchain.nodes,
    },
  };
});

// Register routes
app.use(router.routes()).use(router.allowedMethods());

app.use(bodyParser());

// Start the server
app.listen(3003, () => {
  console.log(`server started...`);
});
