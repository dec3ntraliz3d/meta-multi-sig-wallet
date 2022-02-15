

import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Button, Select, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { parseEther, formatEther } from "@ethersproject/units";
import { Address, AddressInput, Balance, EtherInput, Blockie } from "../components";
import { useContractReader } from "eth-hooks";
import { useLocalStorage } from "../hooks";
import { ethers } from "ethers";
const { Option } = Select;

const axios = require("axios");

export default function CreateTransaction({
  poolServerUrl,
  contractName,
  address,
  setRoute,
  userProvider,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  userSigner,
  DEBUG
}) {
  const history = useHistory();

  // keep track of a variable from the contract in the local React state:
  const nonce = useContractReader(readContracts, contractName, "nonce");
  //const calldataInputRef = useRef("0x");

  if (DEBUG) console.log("🤗 nonce:", nonce);
  if (DEBUG) console.log("price", price);
  // usestate variables
  const [customNonce, setCustomNonce] = useState();
  const [isCreateTxnEnabled, setCreateTxnEnabled] = useState(true);
  const [decodedDataState, setDecodedData] = useState();

  const [selectDisabled, setSelectDisabled] = useState(false);
  const [result, setResult] = useState();

  // useLocalStorage variables. 
  const [to, setTo] = useLocalStorage("to");
  const [amount, setAmount] = useLocalStorage("amount", "0");
  const [callData, setCallData] = useLocalStorage("callData", "0x");
  const [methodName, setMethodName] = useLocalStorage("methodName", "addSigner");

  let decodedData = "";
  let decodedDataObject = "";
  const inputStyle = {
    padding: 10,
  };

  useEffect(() => {
    const inputTimer = setTimeout(async () => {
      console.log("EFFECT RUNNING");
      console.log(`Transactions:methodName:${methodName}`)
      try {
        if (methodName == "transferFunds") {
          // console.log("Send transaction selected")
          // console.log("🔥🔥🔥🔥🔥🔥", amount)
          //const transferCallData = readContracts.MetaMultiSigWallet?.interface?.encodeFunctionData("transferFunds", [to, parseEther("" + parseFloat(amount).toFixed(12))])
          setCallData("0x");
        }
        console.log("latestCallData", callData)
        if (callData !== "0x") {
          decodedDataObject = readContracts.MetaMultiSigWallet?.interface?.parseTransaction({ data: callData });
        }
        console.log("decodedDataObject", decodedDataObject);
        setCreateTxnEnabled(true);
        if (decodedDataObject?.signature === "addSigner(address,uint256)") {
          //setMethodName("addSigner")
          setSelectDisabled(true)
        } else if (decodedDataObject?.signature === "removeSigner(address,uint256)") {
          //setMethodName("removeSigner")
          setSelectDisabled(true)
        }
        decodedData = (
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "left",
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              {decodedDataObject?.signature && <b>Function Signature : </b>}
              {decodedDataObject?.signature}

            </div>
            {decodedDataObject?.functionFragment?.inputs.map((element, index) => {
              if (element.type === "address") {
                return (
                  <div
                    style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}
                  >
                    <b>{element.name} :&nbsp;</b>
                    <Address fontSize={16} address={decodedDataObject?.args[index]} ensProvider={mainnetProvider} />
                  </div>
                );
              }
              if (element.type === "uint256") {
                return (
                  <p style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}>
                    {element.name === "value" ? <><b>{element.name} : </b> <Balance fontSize={16} balance={decodedDataObject?.args[index]} dollarMultiplier={price} /> </> : <><b>{element.name} : </b> {decodedDataObject?.args[index] && decodedDataObject?.args[index].toNumber()}</>}
                  </p>
                );
              }
            })}
          </div>
        );
        setDecodedData(decodedData);
        //setCreateTxnEnabled(true);
        setResult();

      } catch (error) {

        console.log("mistake: ", error);
        if (callData !== "0x") setResult("ERROR: Invalid calldata");
        setCreateTxnEnabled(false);
      }
    }, 500);
    return () => {
      clearTimeout(inputTimer);
    };
  }, [callData, decodedData, amount, methodName]);

  let resultDisplay;
  if (result) {
    if (result.indexOf("ERROR") >= 0) {
      resultDisplay = <div style={{ margin: 16, padding: 8, color: "red" }}>{result}</div>;
    } else {
      resultDisplay = (
        <div style={{ margin: 16, padding: 8 }}>
          <Blockie size={4} scale={8} address={result} /> Tx {result.substr(0, 6)} Created!
          <div style={{ margin: 8, padding: 4 }}>
            <Spin />
          </div>
        </div>
      );
    }
  }

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <div style={{ margin: 8 }}>
          <div style={inputStyle}>
            <Input
              prefix="#"
              disabled
              value={customNonce}
              placeholder={"" + (nonce ? nonce.toNumber() : "loading...")}
              onChange={setCustomNonce}
            />
          </div>
          <div style={{ margin: 8, padding: 8 }}>
            <Select value={methodName} disabled={selectDisabled} style={{ width: "100%" }} onChange={setMethodName}>
              <Option key="transferFunds">transferFunds()</Option>
              <Option disabled={false} key="addSigner">addSigner()</Option>
              <Option disabled={false} key="removeSigner">removeSigner()</Option>
            </Select>
          </div>
          <div style={inputStyle}>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="to address"
              value={to}
              onChange={setTo}
            />
          </div>

          {!selectDisabled && <div style={inputStyle}>
            <EtherInput price={price} mode="USD" value={amount} onChange={setAmount} />
          </div>}
          <div style={inputStyle}>
            <Input
              placeholder="calldata"
              value={callData}
              onChange={e => {
                setCallData(e.target.value);
              }}
            //ref={calldataInputRef}
            />
            {decodedDataState}
          </div>

          <Button
            style={{ marginTop: 32 }}
            disabled={!isCreateTxnEnabled}
            onClick={async () => {
              // setData(calldataInputRef.current.state.value)
              // if (data && data == "0x") {
              //   setResult("ERROR, Call Data Invalid");
              //   return;
              // }
              console.log("customNonce", customNonce);
              const nonce = customNonce || (await readContracts[contractName].nonce());

              const newHash = await readContracts?.MetaMultiSigWallet?.getTransactionHash(
                nonce,
                to,
                parseEther("" + parseFloat(amount).toFixed(12)),
                callData,
              );
              console.log("newHash", newHash);

              const signature = await userSigner?.signMessage(ethers.utils.arrayify(newHash))
              console.log("signature", signature);

              // const recover = await ethers.utils.verifyMessage(newHash, signature)
              const recover = await readContracts?.MetaMultiSigWallet?.recover(newHash, signature);
              console.log("recover", recover);

              const isOwner = await readContracts?.MetaMultiSigWallet?.isOwner(recover);
              console.log("isOwner", isOwner);

              if (isOwner) {
                const res = await axios.post(poolServerUrl, {
                  chainId: localProvider._network.chainId,
                  address: readContracts[contractName].address,
                  nonce: nonce.toNumber(),
                  to,
                  amount,
                  data: callData,
                  hash: newHash,
                  signatures: [signature],
                  signers: [recover],
                });
                // IF SIG IS VALUE ETC END TO SERVER AND SERVER VERIFIES SIG IS RIGHT AND IS SIGNER BEFORE ADDING TY

                console.log("RESULT", res.data);

                setTimeout(() => {
                  history.push("/pool");
                }, 2777);

                setResult(res.data.hash);
                setTo();
                setAmount("0");
                setCallData("0x");
              } else {
                console.log("ERROR, NOT OWNER.");
                setResult("ERROR, NOT OWNER.");
              }
            }}
          >
            Create
          </Button>
        </div>

        {resultDisplay}
      </div>
    </div>
  );
}




