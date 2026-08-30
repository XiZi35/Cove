import { randomBytes } from "node:crypto";
import { appendFileSync, mkdirSync } from "node:fs";
import { registerEntitySecretCiphertext } from "@circle-fin/developer-controlled-wallets";
import "dotenv/config";

const apiKey = process.env.CIRCLE_API_KEY;

if (!apiKey) {
  console.error("请先在 .env.local 或环境变量中设置 CIRCLE_API_KEY");
  process.exit(1);
}

async function main() {
  // 生成 32 字节密钥（64 位十六进制）
  const entitySecret = randomBytes(32).toString("hex");
  console.log("已生成 Entity Secret（请务必保存）：");
  console.log(entitySecret);

  mkdirSync("./recovery", { recursive: true });

  await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
    recoveryFileDownloadPath: "./recovery",
  });

  console.log("\n注册成功！");
  console.log("恢复文件已保存到 ./recovery 目录，请妥善备份。");

  // 写入 .env.local
  appendFileSync(
    ".env.local",
    `\nCIRCLE_ENTITY_SECRET=${entitySecret}\n`
  );
  console.log("已自动写入 .env.local");
}

main().catch((err) => {
  console.error("注册失败:", err);
  process.exit(1);
});