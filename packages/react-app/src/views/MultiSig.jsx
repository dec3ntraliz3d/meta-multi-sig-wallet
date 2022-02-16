import React from "react";
import { Balance, Address, MultiSigTransactionListItem, Events } from "../components";
import QR from "qrcode.react";
import { List } from "antd";

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
        bordered
        dataSource={executeTransactionEvents}
        renderItem={item => {
          return (
            <>
              <MultiSigTransactionListItem item={item} mainnetProvider={mainnetProvider} blockExplorer={blockExplorer} price={price} readContracts={readContracts} contractName={contractName} />
            </>
          );
        }}
      />
    </div>
  );
}
export default MultiSig;
