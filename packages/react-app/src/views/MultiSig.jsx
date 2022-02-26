import React from "react";
import QRCode from "react-qr-code";
import { Balance, Address, TransactionList } from "../components";
import { List, Spin } from "antd";
import { getAbiFromEtherscan } from "../helpers";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

function MultiSig({
  contractAddress,
  localProvider,
  price,
  mainnetProvider,
  blockExplorer,
  executeTransactionEvents,
  contractName,
  readContracts
}) {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState()

  const decodeFunctionData = async (to, data) => {

    if (data == "0x")
      return null
    if (to == contractAddress)
      return (readContracts[contractName]?.interface?.parseTransaction({ data }))
    try {
      // if parseTransaction fails set txnData/decoded function data to null.
      const abi = await getAbiFromEtherscan(to)
      const iface = new ethers.utils.Interface(abi)
      const parsedTransactionData = iface.parseTransaction({ data })
      return parsedTransactionData
    } catch {
      return null
    }
  }
  const updateEvents = async () => {
    const updatedEvents = await Promise.all(executeTransactionEvents.map(async (item) => {
      const txnData = await decodeFunctionData(item.args.to, item.args.data)
      // update event object with decoded function data txnData
      return { ...item, txnData }
    }))

    setEvents(updatedEvents)
    setIsLoading(false)
  }
  useEffect(() => {
    setIsLoading(true)
    // Call update events on page load and new events.
    updateEvents();
  }, [])
  return (
    <div style={{ padding: 32, maxWidth: 750, margin: "auto" }}>
      <div style={{ paddingBottom: 32 }}>
        <div>
          <Balance
            address={contractAddress ? contractAddress : ""}
            provider={localProvider}
            dollarMultiplier={price}
            size={64}
          />
        </div>
        <div>
          <QRCode
            value={contractAddress ? contractAddress.toString() : ""}
            size={180}
            level="H"
          />
        </div>
        <div>
          <Address
            address={contractAddress ? contractAddress : ""}
            ensProvider={mainnetProvider}
            blockExplorer={blockExplorer}
            fontSize={32}
          />
        </div>
      </div>
      {isLoading ?

        <Spin /> :

        <List

          dataSource={events.reverse()}
          renderItem={item => {
            return (
              <>
                <TransactionList
                  txnData={item.txnData}
                  mainnetProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  price={price}
                  transactionHash={item.args.hash}
                  addressedTo={item.args.to}
                  nonce={item.args.nonce.toString()}
                  value={item.args.value}
                />
              </>
            );
          }}
        />
      }
    </div>
  );
}
export default MultiSig;
