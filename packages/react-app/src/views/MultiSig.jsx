import React from "react";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Balance, Address, TransactionListItem } from "../components";
import QR from "qrcode.react";
import { List } from "antd/lib/form/Form";

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
            value={contractAddress ? contractAddress.toString() : ""}
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
    </div>
  );
}

export default MultiSig;
