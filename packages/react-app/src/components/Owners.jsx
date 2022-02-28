import { List, Select, Spin } from "antd";
import { Address } from "../components";
import { useEffect, useState } from "react";
export default function Owners({

  signaturesRequired,
  mainnetProvider,
  blockExplorer,
  readContracts,
  contractName

}) {

  const [owners, setOwners] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const getOwners = async () => {

    const ownersArrayLength = await readContracts[contractName]?.ownersArrayLength()
    let owners = [];
    for (let index = 0; index < ownersArrayLength?.toNumber(); index++) {
      const owner = await readContracts[contractName]?.owners(index)
      const isOwner = await readContracts[contractName]?.isOwner(owner)
      isOwner && owners.push(owner)

    }
    return owners
  }

  useEffect(() => {

    getOwners().then((owners) => {
      setIsLoaded(true)
      setOwners(owners)
    })
  }, []);

  return (
    <div>
      <h2 style={{ marginTop: 32 }}>
        Signers
      </h2>
      <h3 >
        Signatures Required:{signaturesRequired ? signaturesRequired?.toString() : 0}
      </h3>
      {isLoaded ?
        <List
          style={{ maxWidth: 300, margin: "auto", marginTop: 10 }}
          bordered
          dataSource={owners}
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
        /> :
        < Spin />
      }
    </div>
  );
}
