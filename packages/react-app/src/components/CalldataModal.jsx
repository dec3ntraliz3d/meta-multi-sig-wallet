import { Modal } from "antd"
import { ethers } from "ethers"

const CalldataModal = ({
    parsedTransactionData,
    isModalVisible,
    hideModal,
    proposeTransaction,
    value,
    appUrl,
    data,
    appIcon
}) => {

    parsedTransactionData && console.log("CalldDataModal-> parsedTransactionData", parsedTransactionData)

    return (
        <Modal

            title="Propose Transaction ?"
            visible={isModalVisible}
            onOk={() => {

                hideModal()
                proposeTransaction()


            }}
            //confirmLoading={confirmLoading}
            onCancel={hideModal}
        >
            <div>
                <img
                    src={appIcon}
                    style={{ width: 40, height: 40 }}
                />
            </div>
            <p>{appUrl}</p>
            <p>name:{parsedTransactionData.name}<br />
                sighash:{parsedTransactionData.sighash}<br />
                signature:{parsedTransactionData.signature}<br />
                value:{ethers.utils.formatEther(value)}<br />
                data:{data}</p>
            {/* <p>{parsedTransactionData}</p> */}
            {/* functionFragment?.name */}
            {/* Value  */}


        </Modal>

    )
}

export default CalldataModal