
export const getAbiFromEtherscan = async (contractAddress) => {

    const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=CPK96XEP4FNMCAPZR9JEQD3NAJ9MHCAH41`

    console.log("Getting data from etherscan")
    const response = await fetch(url)
    const data = await response.json()
    return data.result
}
