import yaml from "js-yaml"
import axios, { AxiosResponse } from "axios"
import { HttpsProxyAgent } from "https-proxy-agent"
import { IP_DETECTOR, IpApiResponse } from "./utils/ip_engine"

interface Listener {
    name: string
    type: string
    port: number
    proxy: string
}

interface YamlConfig {
    listeners?: Array<Listener>
}

// 代理地址
const PROXY_HOST = "http://127.0.0.1"

// 网络检测的超时时间
const TIMEOUT = 10 * 1000

class MultiPortChecker {
    private proxies: Listener[]
    private availablePorts: Set<number>
    private uniqueContents: Set<string>

    constructor(private fileContent: string) {
        this.availablePorts = new Set<number>()
        this.uniqueContents = new Set<string>()
        this.proxies = this.readProxies()
    }

    private readProxies(): Listener[] {
        const config = yaml.load(this.fileContent) as YamlConfig
        if (config.listeners == null || config.listeners.length === 0) {
            throw new Error("没有找到Listeners配置")
        }
        return config.listeners
    }

    private genDisplayMsg(data: IpApiResponse): string {
        const parts = [data.city, data.region].filter(
            (part) => part !== null && part !== "null" && part !== ""
        )

        // 去重
        const uniqueParts = [...new Set(parts)]
        return data.ip + " 🌍" + uniqueParts.join(" ")
    }

    private async checkProxy(port: number): Promise<[boolean, string]> {
        const proxyUrl = `${PROXY_HOST}:${port}`

        try {
            // 创建代理配置
            const agent = new HttpsProxyAgent(proxyUrl)

            const response: AxiosResponse = await axios.get(IP_DETECTOR, {
                httpsAgent: agent,
                httpAgent: agent,
                timeout: TIMEOUT,
                validateStatus: (status) => status === 200,
            })

            if (response.status === 200) {
                const data = response.data as IpApiResponse
                return [true, this.genDisplayMsg(data)]
            }
        } catch (error) {
            // 静默处理错误，就像Python版本一样
        }

        return [false, ""]
    }

    public async checkAllProxies(): Promise<void> {
        const tasks = this.proxies.map((proxy) => this.checkProxy(proxy.port))

        try {
            const results = await Promise.all(tasks)

            for (let i = 0; i < this.proxies.length; i++) {
                const proxy = this.proxies[i]
                const [success, content] = results[i]

                if (success) {
                    this.availablePorts.add(proxy.port)
                    this.uniqueContents.add(content)
                    console.log(
                        `✅ ${proxy.port}, ${proxy.proxy} >>> ${content}`
                    )
                } else {
                    console.log(
                        `❌ ${proxy.port}, ${proxy.proxy} >>> (连接失败)`
                    )
                }
            }
        } catch (error) {
            console.error("检查代理时发生错误:", error)
        }
    }

    public printSummary(): void {
        console.log("\n" + "=".repeat(50))
        console.log(`检查时间: ${new Date().toLocaleString("zh-CN")}`)
        console.log(`可用端口数量: ${this.availablePorts.size}`)
        console.log(`不同IP数量: ${this.uniqueContents.size}`)

        if (this.uniqueContents.size > 0) {
            console.log("\n可用IP列表:")
            const sortedIPs = Array.from(this.uniqueContents).sort()
            for (const ip of sortedIPs) {
                console.log(`- ${ip}`)
            }
        }
    }
}

export { MultiPortChecker as ProxyChecker }
