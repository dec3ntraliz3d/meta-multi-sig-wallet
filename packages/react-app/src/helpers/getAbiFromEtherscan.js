import { ETHERSCAN_KEY } from "../constants"
const CHAINID_TO_URL_PREFIX = {
    42: "api-kovan",
    1: "api",
    4: "api-rinkeby",
    5: "api-goerli"
}
export const getAbiFromEtherscan = async (contractAddress, chainId = 1) => {
    const url = `https://${CHAINID_TO_URL_PREFIX[chainId]}.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${ETHERSCAN_KEY}`
    const response = await fetch(url)
    const data = await response.json()
    return data.result
}
