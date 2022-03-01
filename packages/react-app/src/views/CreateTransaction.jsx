import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Select, Input, Space } from "antd";
import { AddressInput, EtherInput, Owners } from "../components";
import { useContractReader } from "eth-hooks";
import { useLocalStorage } from "../hooks";
import { ethers } from "ethers";
import { WalletConnectInput } from "../components";
const { Option } = Select;

const axios = require("axios");

export default function CreateTransaction({
  poolServerUrl,
  contractName,
  mainnetProvider,
  localProvider,
  price,
  readContracts,
  userSigner,
  blockExplorer,
  signaturesRequired,


}) {
  const history = useHistory();

  const nonce = useContractReader(readContracts, contractName, "nonce");
  const multiSigContractAddress = readContracts[contractName]?.address;

  const [selectDisabled, setSelectDisabled] = useState(false);
  const [methodName, setMethodName] = useLocalStorage("methodName", "transferFunds")
  const [newSignaturesRequired, setNewSignaturesRequired] = useState(signaturesRequired)
  const [signer, setSigner] = useState()
  const [transferTo, setTransferTo] = useLocalStorage("transferTo")
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState({
    to: null, amount: null, data: null, parsedTxnData: null
  })

  // This function is passed to walletconnect component to update states. Lift state up :)
  const updateWalletConnectTxnData = (transaction) => {
    setTransaction(transaction)
  }

  const createTransactionData = () => {
    setSelectDisabled(true)

    if (methodName == "transferFunds") {
      console.log("methodName", methodName)
      setTransaction(prevState => ({
        ...prevState, to: transferTo, data: "0x", parsedTxnData: null
      }))
      return
    }
    const functionData = readContracts[contractName]?.interface?.encodeFunctionData(methodName, [signer, newSignaturesRequired])
    const decodedTxnData = readContracts[contractName]?.interface?.parseTransaction({ data: functionData })
    setTransaction(prevState => ({
      ...prevState,
      to: multiSigContractAddress,
      data: functionData,
      parsedTxnData: decodedTxnData
    }))

  }

  // When user confirms transaction, details are sent to backend.
  const confirmTransaction = async () => {

    setLoading(true)
    const newHash = await readContracts?.MetaMultiSigWallet?.getTransactionHash(
      nonce.toNumber(),
      transaction.to,
      ethers.utils.parseEther("" + parseFloat(transaction.amount).toFixed(12)),
      transaction.data ,
    );

    const signature = await userSigner?.signMessage(ethers.utils.arrayify(newHash))
    console.log("signature", signature);

    const recover = await readContracts?.MetaMultiSigWallet?.recover(newHash, signature);
    console.log("recover", recover);

    const isOwner = await readContracts?.MetaMultiSigWallet?.isOwner(recover);
    console.log("isOwner", isOwner);

    if (isOwner) {
      const res = await axios.post(poolServerUrl, {
        chainId: localProvider._network.chainId,
        address: multiSigContractAddress,
        nonce: nonce.toNumber(),
        to: transaction.to,
        amount: transaction.amount,
        data: transaction.data,
        parsedTxnData: transaction.parsedTxnData,
        hash: newHash,
        signatures: [signature],
        signers: [recover],
      });
      console.log("RESULT", res.data);
      setTimeout(() => {
        history.push("/pool");
        setLoading(false)
        setSelectDisabled(false)

      }, 2777);
    } else {
      console.log("ERROR, NOT OWNER.");
    }
  }

  return (
    <div>

      <div style={{ padding: 16, width: 400, margin: "auto", marginTop: 64, marginBottom: 20 }}>
        <div style={{ margin: 8 }}>
          <div style={{ margin: 8, padding: 8 }}>
            <Select value={methodName} disabled={selectDisabled} style={{ width: "100%" }} onChange={setMethodName}>
              <Option key="transferFunds">Transfer </Option>
              <Option key="addSigner">Add Signer</Option>
              <Option key="removeSigner">Remove Signer</Option>

            </Select>
          </div>
          <div style={{ padding: 10 }}>
            {methodName != "transferFunds" &&
              <AddressInput
                autoFocus
                disabled={selectDisabled}
                ensProvider={mainnetProvider}
                placeholder={"Signer address"}
                value={signer}
                onChange={setSigner}
              />
            }

            {methodName == "transferFunds" &&

              <AddressInput
                autoFocus
                disabled={selectDisabled}
                ensProvider={mainnetProvider}
                placeholder={"to address"}
                value={transferTo}
                onChange={setTransferTo}
              />

            }

          </div>
          {methodName != "transferFunds" &&
            <div style={{ margin: 8, padding: 8 }}>
              <Input
                placeholder="new # of signatures required"
                value={newSignaturesRequired}
                disabled={selectDisabled}
                onChange={(e) => { setNewSignaturesRequired(e.target.value) }}
              />
            </div>
          }

          {methodName == "transferFunds" && <div style={{ padding: 10 }}>
            <EtherInput
              price={price}
              mode="USD"
              value={transaction.amount}
              onChange={(amount) => {
                setTransaction(prevState => ({
                  ...prevState, amount
                }))
              }
              }
              disabled={selectDisabled}
            />
          </div>}

          {!selectDisabled && <Button
            style={{ marginTop: 32 }}
            type="primary"
            onClick={createTransactionData}

          > Create
          </Button>
          }

          {selectDisabled &&
            <Space style={{ marginTop: 32 }}>
              <Button
                loading={loading}
                onClick={confirmTransaction}
                type="primary"

              >
                Confirm
              </Button>
              <Button
                onClick={() => {
                  setSelectDisabled(false)
                }}
              >
                Cancel
              </Button>
            </Space>}

        </div>

      </div>
      <WalletConnectInput
        chainId={localProvider?._network.chainId}
        address={multiSigContractAddress}
        transaction={transaction}
        updateWalletConnectTxnData={updateWalletConnectTxnData}
        confirmTransaction={confirmTransaction}

      />
      <Owners
        signaturesRequired={signaturesRequired}
        mainnetProvider={mainnetProvider}
        blockExplorer={blockExplorer}
        readContracts={readContracts}
        contractName={contractName}
      />
    </div>
  );
}




