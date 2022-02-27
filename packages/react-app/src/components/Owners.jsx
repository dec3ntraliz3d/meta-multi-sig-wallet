import { List, Select, Spin } from "antd";
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
  const [isLoading, setIsLoading] = useState(false)

  const getOwners = async () => {

    const ownersArrayLength = await readContracts[contractName]?.ownersArrayLength()
    let _owners = [];
    for (let index = 0; index < ownersArrayLength?.toNumber(); index++) {
      const owner = await readContracts[contractName]?.owners(index)
      const isOwner = await readContracts[contractName]?.isOwner(owner)
      isOwner && _owners.push(owner)

    }
    setOwners([... new Set(_owners)])
    setIsLoading(false)

  }

  useEffect(() => {
    setIsLoading(true)
    getOwners();
  }, []);


  return (

    <div>
      <h2 style={{ marginTop: 32 }}>
        Signers
      </h2>
      <h3 >
        Signatures Required:{signaturesRequired ? signaturesRequired?.toString() : 0}
      </h3>
      {isLoading ?
        < Spin /> :
        <List
          style={{ maxWidth: 300, margin: "auto", marginTop: 10 }}
          bordered
          dataSource={owners ? owners : ""}
          renderItem={(item) => {
            return (
              <List.Item key={item}>
                <Address
                  address={item}
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  fontSize={20}
                />
              </List.Item>
            )
          }}
        />
      }
    </div>
  );
}
