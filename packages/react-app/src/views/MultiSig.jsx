import React from "react";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Balance, Address, TransactionListItem } from "../components";
import QR from "qrcode.react";
import { List } from "antd/lib/form/Form";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
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
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract


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
          <QR
            value={contractAddress ? contractAddress : ""}
            size="180"
            level="H"
            includeMargin
            renderAs="svg"
            imageSettings={{ excavate: false }}
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
      <List
        dataSource={executeTransactionEvents}
        renderItem={item => {
          return (

            <>
              <TransactionListItem item={item} mainnetProvider={mainnetProvider} blockExplorer={blockExplorer} price={price} readContracts={readContracts} contractName={contractName} />
            </>

          );
        }}
      >

      </List>




      {/* <List
        bordered
        dataSource={executeTransactionEvents}
        renderItem={item => {

          return (
            <>
              <TransactionListItem item={item} mainnetProvider={mainnetProvider} blockExplorer={blockExplorer} price={price} readContracts={readContracts} contractName={contractName} />
            </>
          );
        }}
      /> */}


    </div>
  );
}

export default MultiSig;
