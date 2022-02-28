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
  const [id, setId] = useState()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [parsedTransactionData, setParsedTransactionData] = useState()

  useEffect(() => {

    // If walletconnect URI is not empty , initiate wallet connection
    if (walletConnectUri) {
      initiateAndSubscribe()
    }

  }, [walletConnectUri])

  const initiateAndSubscribe = () => {
    let connector;
    try {
      // Create connector
      connector = new WalletConnect(
        {
          // Required
          uri: walletConnectUri,
          // Required
          clientMeta: {
            description: "Multisig Wallet",
            url: "https://multisig-kovan.surge.sh",
            icons: ["https://walletconnect.org/walletconnect-logo.png"],
            name: "Meta Multisig",
          },
        },

      );

    } catch (error) {

      // If wallet connect URI is invalid . Show error message and set uri to ""
      alert(error)
      setWalletConnectUri("")
      return

    }

    // Subscribe to session requests
    connector.on("session_request", (error, payload) => {
      if (error) {
        throw error;
      }

      // Handle Session Request
      console.log("Event: session_request", payload)

      // Get peer metadata from params[0] and update state
      setPeerMeta(payload.params[0].peerMeta)

      //Automatically accept session_request from Dapp. 
      connector.approveSession({
        accounts: [                 // required
          address   // This is the address of multisig wallet
        ],
        chainId            // required
      })


      if (connector.connected) {
        setIsConnected(true)
        console.log("Session successfully connected.")
      }

      /* payload:
      {
        id: 1,
        jsonrpc: '2.0'.
        method: 'session_request',
        params: [{
          peerId: '15d8b6a3-15bd-493e-9358-111e3a4e6ee4',
          peerMeta: {
            name: "WalletConnect Example",
            description: "Try out WalletConnect v1.0",
            icons: ["https://example.walletconnect.org/favicon.ico"],
            url: "https://example.walletconnect.org"
          }
        }]
      }
      */
    });


    // Subscribe to call requests
    connector.on("call_request", (error, payload) => {
      if (error) {
        throw error;
      }

      // Handle Call Request
      console.log("Event: call_request", payload)
      parseCallRequest(payload)

      /* payload:
      {
        id: 1,
        jsonrpc: '2.0'.
        method: 'eth_sign',
        params: [
          "0xbc28ea04101f03ea7a94c1379bc3ab32e65e62d3",
          "My email is john@doe.com - 1537836206101"
        ]
      }
      */
    });

    connector.on("disconnect", (error, payload) => {

      console.log("Event: disconnect", payload)

      if (error) {

        console.log("Error: disconnect event")
        throw error;
      }

      cleanUp()

    });

    console.log("connector", connector)
    setWalletConnectConnector(connector)

  }

  const killSession = () => {

    console.log("ACTION", "killSession")
    // Kill Session
    setIsConnected(false)
    setWalletConnectUri("")

    if (walletConnectConnector.connected) {
      walletConnectConnector.killSession()

    }

  }

  // Parse wallet connect call request data into state variables
  const parseCallRequest = (payload) => {
    const callData = payload.params[0]
    setId(payload.id)
    setValue(callData.value)
    setTo(callData.to)
    setData(callData.data)

  }

  useEffect(() => {
    if (data && to) {
      //decode function data 
      decodeFunctionData()
    }
  }, [data])

  // Try to parse callData when available. Parse data is shown on the confirmation Modal. 
  const decodeFunctionData = async () => {


    try {
      const abi = await getAbiFromEtherscan(to)
      const iface = new ethers.utils.Interface(abi)
      const parsedTransactionData = iface.parseTransaction({ data })
      setParsedTransactionData(parsedTransactionData)
    } catch (error) {
      console.log(error)
      // Unable to parse calldata using ABI. 
      setParsedTransactionData(null)
    }

    setIsModalVisible(true)


  }
  const hideModal = () => setIsModalVisible(false)

  const proposeTransaction = () => {

    // This function can be used to pass data to parent.
    // When user confirms on the CallModal component ( Child of this component) this function get called.

    console.log("Accepted wallet connect call request.")


    loadWalletConnectData({
      data, // calldata received via walletconnect
      to,  // Contract address 
      value,
      txnData: parsedTransactionData  // this is parsedtransaction data . Null when unable to decode function.
    })

  }

  /*
  Clean up local storage related to walletConnect
  Set walletconnect Uri to "" 
  */
  const cleanUp = () => {

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
        proposeTransaction={proposeTransaction}
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




