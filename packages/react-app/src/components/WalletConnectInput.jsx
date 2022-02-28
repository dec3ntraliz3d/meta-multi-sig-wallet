import { Button, Input } from "antd"
import WalletConnect from "@walletconnect/client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks";
import { getAbiFromEtherscan } from "../helpers";
import { ethers } from "ethers";
import CalldataModal from "./CalldataModal";

const WalletConnectInput = ({
  chainId,
  address,
  loadWalletConnectData
}) => {

  const [walletConnectConnector, setWalletConnectConnector] = useLocalStorage("walletConnectConnector")
  const [walletConnectUri, setWalletConnectUri] = useLocalStorage("walletConnectUri", "")
  const [isConnected, setIsConnected] = useLocalStorage("isConnected", false)
  const [peerMeta, setPeerMeta] = useLocalStorage("peerMeta")
  const [data, setData] = useState()
  const [to, setTo] = useState()
  const [value, setValue] = useState()
  const [callRequestId, setCallRequestId] = useState()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [parsedTransactionData, setParsedTransactionData] = useState()

  useEffect(() => {
    if (walletConnectUri) {
      setupAndSubscribe()
    }
  }, [walletConnectUri])


  const setupAndSubscribe = () => {
    const connector = setupConnector()
    if (connector) {
      subscribeToEvents(connector)
      setWalletConnectConnector(connector)
    }
  }

  const setupConnector = () => {
    let connector;
    try {
      connector = new WalletConnect(
        {
          uri: walletConnectUri,
          clientMeta: {
            description: "Multisig Wallet",
            url: "https://multisig-kovan.surge.sh",
            icons: ["https://walletconnect.org/walletconnect-logo.png"],
            name: "Meta Multisig",
          },
        },

      );
      return connector

    } catch (error) {

      alert(error)
      setWalletConnectUri("")
      return connector
    }
  }

  const subscribeToEvents = (connector) => {

    connector.on("session_request", (error, payload) => {
      if (error) {
        throw error;
      }
      console.log("Event: session_request", payload)
      setPeerMeta(payload.params[0].peerMeta)

      connector.approveSession({
        accounts: [address],
        chainId
      })

      if (connector.connected) {
        setIsConnected(true)
        console.log("Session successfully connected.")
      }
    });

    connector.on("call_request", (error, payload) => {
      if (error) {
        throw error;
      }

      console.log("Event: call_request", payload)
      parseCallRequest(payload)

    });

    connector.on("disconnect", (error, payload) => {

      console.log("Event: disconnect", payload)

      if (error) {

        console.log("Error: disconnect event")
        throw error;
      }

      resetConnection()

    });

  }

  const parseCallRequest = (payload) => {
    const callData = payload.params[0]
    setCallRequestId(payload.id)
    setValue(callData.value)
    setTo(callData.to)
    setData(callData.data)
  }

  useEffect(() => {
    if (data && to) {
      decodeFunctionData()
    }
  }, [data])


  const decodeFunctionData = async () => {
    try {
      const abi = await getAbiFromEtherscan(to)
      const iface = new ethers.utils.Interface(abi)
      const parsedTransactionData = iface.parseTransaction({ data })
      setParsedTransactionData(parsedTransactionData)
    } catch (error) {
      console.log(error)
      // If unable to decode funtion signature using etherscan. 
      setParsedTransactionData(null)
    }
    setIsModalVisible(true)
  }


  const killSession = () => {
    console.log("ACTION", "killSession")
    if (walletConnectConnector.connected) {
      walletConnectConnector.killSession()
    }
  }

  const hideModal = () => setIsModalVisible(false)

  const handleOk = () => {
    console.log("Accepted wallet connect call request.")
    /*
      Push data to parent . Todo: refactor by lifting the states up. 
    */
    loadWalletConnectData({
      data,
      to,
      value,
      txnData: parsedTransactionData
    })
  }


  const resetConnection = () => {

    setWalletConnectUri("")
    setIsConnected(false)
    setWalletConnectConnector(null)
    setData()
    setValue()
    setTo()

  }

  return (
    <div style={{ width: 600, margin: "auto" }}>

      <Input
        bordered
        placeholder="Paste wc: uri"
        disabled={isConnected}
        value={walletConnectUri}
        onChange={e => setWalletConnectUri(e.target.value)}
        addonBefore={<img src="wc-logo.svg" style={{ height: 20, width: 20 }} />}

      />

      {isConnected &&
        <div style={{ marginTop: 10 }}>
          <img
            src={peerMeta.icons[0]}
            style={{ width: 25, height: 25 }}
          />
          <p>{peerMeta.url}</p>

        </div>}
      {isModalVisible && <CalldataModal
        parsedTransactionData={parsedTransactionData}
        isModalVisible={isModalVisible}
        hideModal={hideModal}
        handleOk={handleOk}
        value={value}
        appUrl={peerMeta.url}
        data={data}
        appIcon={peerMeta.icons[0]}

      />}

      {isConnected && <Button
        onClick={killSession}
        type="primary">
        Disconnect

      </Button>
      }
    </div>
  )
}
export default WalletConnectInput




