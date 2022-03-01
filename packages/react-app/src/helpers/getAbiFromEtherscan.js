
export const getAbiFromEtherscan = async (contractAddress, chainId = 1) => {

    const CHAINID_TO_URL = {
        42: "api-kovan",
        1: "api",
        4: "api-rinkeby",
        5: "api-goerli"
    }

    const url = `https://${CHAINID_TO_URL[chainId]}.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=CPK96XEP4FNMCAPZR9JEQD3NAJ9MHCAH41`
    console.log("Api URL", url)
    const response = await fetch(url)
    const data = await response.json()
    return data.result
}
