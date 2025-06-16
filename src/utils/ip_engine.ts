interface IpApiResponse {
    ip: string
    city: string
    region: string
    country_name: string
}

// 检查代理的IP的引擎
const IP_DETECTOR = "https://ipapi.co/json/"

export { IP_DETECTOR, IpApiResponse }
