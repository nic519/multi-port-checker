interface IpApiResponse {
    ip: string
    city: string
    region: string
    country_name: string
}

// 检查代理的IP的引擎
// https://github.com/ihmily/ip-info-api?tab=readme-ov-file
// const IP_DETECTOR = "https://ipapi.co/json/"

const IP_DETECTOR = "https://api.ip.sb/geoip/"

export { IP_DETECTOR, IpApiResponse }
