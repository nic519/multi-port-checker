import axios, { AxiosResponse } from "axios"
import { ProxyChecker } from "./src/view_ip"
import dotenv from "dotenv"
import fs from "fs"

// 加载环境变量
dotenv.config()

async function main(): Promise<void> {
    // 本地文件的情况
    const configPath =
        "/Users/nicholas/Library/Application Support/mihomo-party/profiles/1977d7ab1ca.yaml"
    const fileContent = fs.readFileSync(configPath, "utf8")

    // 远程文件的情况
    // const apiUrl = process.env.SUB_URL

    // if (!apiUrl) {
    //     throw new Error("Missing required environment variables")
    // }
    // const fileContent = await axios.get(apiUrl).then((res) => res.data)

    const checker = new ProxyChecker(fileContent)
    await checker.checkAllProxies()
    checker.printSummary()
}

// 如果直接运行此文件
main().catch(console.error)
