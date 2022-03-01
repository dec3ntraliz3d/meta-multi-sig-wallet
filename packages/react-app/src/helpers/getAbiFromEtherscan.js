
export const getAbiFromEtherscan = async (contractAddress) => {

    // need to update code to automatically select correct api URL based on current network. 

    const url = `https://api-kovan.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=CPK96XEP4FNMCAPZR9JEQD3NAJ9MHCAH41`

    const response = await fetch(url)
    const data = await response.json()
    return data.result
}
