import { Button, Input, Modal, notification } from "antd"
import WalletConnect from "@walletconnect/client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks";
import { getAbiFromEtherscan } from "../helpers";
import { ethers } from "ethers";
import CalldataModal from "./CalldataModal";
import { useHistory } from "react-router-dom";

const axios = require("axios");

const WalletConnectInput = ({
  chainId,
  address, // Address of the wallet that will connect to dapp via wallet connect.
  loadWalletConnectData // funtion passed from parent component to pass data,to,value, parsed transaction data.
}) => {

  const [walletConnectConnector, setWalletConnectConnector] = useLocalStorage("walletConnectConnector")
  const [walletConnectUri, setWalletConnectUri] = useLocalStorage("walletConnectUri", "")
  const [isConnected, setIsConnected] = useLocalStorage("isConnected", false)
  const [peerMeta, setPeerMeta] = useLocalStorage("peerMeta")
  const [data, setData] = useState()
  const [to, setTo] = useState()
  const [value, setValue] = useState()
  const [id, setId] = useState()
  const [isModalVisible, setIsModalVisible] = useLocalStorage("isModalVisible", false)
  const [parsedTransactionData, setParsedTransactionData] = useState()

  const history = useHistory();

  useEffect(() => {

    // If walletconnect URI is not empty , initiate wallet connection
    if (walletConnectUri) {
      initiateAndSubscribe()
    }

  }, [walletConnectUri])

  const initiateAndSubscribe = () => {
    // Create connector
    const connector = new WalletConnect(
      {
        // Required
        uri: walletConnectUri,
        // Required
        clientMeta: {
          description: "Multisig Wallet built using Scaffold-eth",
          url: "http://multisig.dec3ntraliz3d.surge.sh",
          icons: ["https://walletconnect.org/walletconnect-logo.png"],
          name: "Meta Mulisig Wallet",
        },
      },

    );

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

    setWalletConnectConnector(connector)

  }

  const killSession = () => {

    console.log("ACTION", "killSession")
    // Kill Session

    if (walletConnectConnector.connected) {
      walletConnectConnector.killSession()

    }

  }

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

  const decodeFunctionData = async () => {

    // get contract ABI from Etherscan and update state variable
    // then decode function data
    try {
      const abi = await getAbiFromEtherscan(to)
      const iface = new ethers.utils.Interface(abi)
      const parsedTransactionData = iface.parseTransaction({ data })
      setParsedTransactionData(parsedTransactionData)
    } catch (error) {
      console.log(error)
      setParsedTransactionData(null)
    }

    setIsModalVisible(true)


  }
  const hideModal = () => setIsModalVisible(false)
  const proposeTransaction = () => {

    // This function can be used to pass data to parent.
    // When user confirms on the CallModal component this function get called.
    // provide calldata, value, to, 
    console.log("Transaction proposed")
    loadWalletConnectData({
      data,
      to,
      value,
      txnData: parsedTransactionData
    })
    // Pass values to parent to update parents data, to ,value
  }
  const cleanUp = () => {
    // Clean up local storage related to walletConnect
    //Set wc Uri to empty 
    // Set connector to null 
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




