import { List, Select } from "antd";
import { Address } from "../components";
import { useContractReader } from "eth-hooks";
import { useEffect, useState } from "react";
const { Option } = Select;
export default function Owners({

  signaturesRequired,
  mainnetProvider,
  blockExplorer,
  readContracts,
  contractName

}) {

  const [owners, setOwners] = useState([])

  const getOwners = async () => {

    const ownersArrayLength = await readContracts[contractName]?.ownersArrayLength()
    console.log("ownersArrayLength", ownersArrayLength)
    let _owners = [];
    for (let index = 0; index < ownersArrayLength?.toNumber(); index++) {
      const owner = await readContracts[contractName]?.owners(index)
      const isOwner = await readContracts[contractName]?.isOwner(owner)
      isOwner && _owners.push(owner)

    }
    setOwners([... new Set(_owners)])
  }

  useEffect(() => {
    getOwners();
  }, []);


  return (

    <div>
      <h2 style={{ marginTop: 32 }}>
        Signatures Required:{signaturesRequired ? signaturesRequired?.toString() : 0}
      </h2>
      <List
        style={{ maxWidth: 400, margin: "auto", marginTop: 32 }}
        bordered
        dataSource={owners ? owners : ""}
        renderItem={(item) => {
          return (
            <List.Item key={item}>
              <Address
                address={item}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={24}
              />
              {/* 

              <div
                style={{ padding: 16 }}
              >
                {"👍"}
              </div> */}
            </List.Item>
          )
        }}
      />
    </div>
  );
}
