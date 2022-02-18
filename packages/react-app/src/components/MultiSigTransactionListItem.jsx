import React, { useState } from "react";
import { Button, List } from "antd";
import { ethers } from "ethers";
import { Address, Balance, Blockie, TransactionDetailsModal } from "../components";
import { EllipsisOutlined } from "@ant-design/icons";


const MultiSigTransactionListItem = function ({ item,
  mainnetProvider,
  blockExplorer,
  price,
  readContracts,
  contractName,
  children }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [txnInfo, setTxnInfo] = useState(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const data = item?.args[3]

  console.log("🔥🔥🔥🔥dog", item)
  let txnData;
  try {
    data != "0x" ? txnData = readContracts[contractName]?.interface?.parseTransaction({ data }) : txnData = "";
    console.log("txnData", txnData)


  } catch (error) {
    console.log("ERROR", error)
  }
  return <>
    <TransactionDetailsModal
      visible={isModalVisible}
      txnInfo={txnData}
      handleOk={handleOk}
      mainnetProvider={mainnetProvider}
      price={price}
    />
    <List.Item key={item.args.hash} style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 55,
          fontSize: 12,
          opacity: 0.5,
          display: "flex",
          flexDirection: "row",
          width: "90%",
          justifyContent: "space-between",
        }}
      >
        <p>
          <b>Event Name :&nbsp;</b>
          {txnData ? txnData.functionFragment.name : "Transfer Funds"}&nbsp;
        </p>
        <p>
          <b>Addressed to :&nbsp;</b>
          {item.args.to}
        </p>
      </div>
      {<b style={{ padding: 16 }}>#{typeof (item.args.nonce) === "number" ? item.args.nonce : item.args.nonce.toNumber()}</b>}
      <span>
        <Blockie size={4} scale={8} address={item.args.hash} /> {item.args.hash.substr(0, 6)}
      </span>
      <Address address={item.args.to} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={16} />
      <Balance balance={item.args.value ? item.args.value : ethers.utils.parseEther("" + parseFloat(item.args.value).toFixed(12))} dollarMultiplier={price} />
      <>
        {
          children
        }
      </>
      <Button
        onClick={showModal}
      >
        <EllipsisOutlined />
      </Button>

    </List.Item>
  </>
};
export default MultiSigTransactionListItem;

