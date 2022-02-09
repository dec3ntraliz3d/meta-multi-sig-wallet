import { List, Select, Input, Button } from "antd";
import React, { useState } from "react";
import { useEffect } from "react";

import { Address, AddressInput } from "../components";
const { Option } = Select;

export default function Owners({
  contractName,
  signaturesRequired,
  readContracts,
  ownerEvents,
  address,
  yourLocalBalance,
  mainnetProvider,
  price,
  blockExplorer

}) {
  const [methodName, setMethodName] = useState("addSigner");
  const [newOwner, setNewOwner] = useState("")
  const [newSignaturesRequired, setNewSignaturesRequired] = useState(1)
  const [callData, setCallData] = useState("0x")
  useEffect(() => {
    console.log(`newOwner: ${newOwner}`)
    console.log("calldata", callData)
  }, [newOwner, callData])
  return (
    <div>
      <h2 style={{ marginTop: 32 }}>
        Signatures Required:{signaturesRequired ? signaturesRequired.toString() : 0}
      </h2>
      <List
        style={{ maxWidth: 400, margin: "auto", marginTop: 32 }}
        bordered
        dataSource={ownerEvents}
        renderItem={(item) => {
          return (
            <List.Item key={item.blockNumber + item.blockHash}>
              <Address
                address={item.args[0]}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={32}
              />
              <div
                style={{ padding: 16 }}
              >
                {item.args[1] ? "👍" : "👎"}
              </div>
            </List.Item>
          )
        }}
      />
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <div style={{ margin: 8, padding: 8 }}>
          <Select value={methodName} style={{ width: "100%" }} onChange={setMethodName}>
            <Option key="addSigner">addSigner()</Option>
            <Option key="removeSigner">removeSigner()</Option>
          </Select>
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <AddressInput
            autoFocus
            ensProvider={mainnetProvider}
            placeholder="new owner address"
            value={newOwner}
            onChange={setNewOwner}
          />
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <Input
            placeholder="new # of signatures required"
            value={newSignaturesRequired}
            onChange={(e) => { setNewSignaturesRequired(e.target.value) }}
          />
        </div>
        <div style={{ margin: 8, padding: 8 }}>
          <Button onClick={() => {

            setCallData(readContracts[contractName].interface.encodeFunctionData(methodName, [newOwner, newSignaturesRequired]))


            // setAmount("0")
            // setTo(readContracts[contractName].address)
            // setTimeout(() => {
            //   history.push('/create')
            // }, 777)
          }}>
            Create Tx
          </Button>
        </div>

      </div>


    </div>
  );
}
