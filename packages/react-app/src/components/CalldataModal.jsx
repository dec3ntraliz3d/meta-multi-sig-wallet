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

    return (
        <Modal

            title="Propose Transaction ?"
            visible={isModalVisible}
            onOk={() => {

                hideModal()
                proposeTransaction()
            }}
            onCancel={hideModal}
        >
            <div>
                <img
                    src={appIcon}
                    style={{ width: 40, height: 40 }}
                />
            </div>
            <p>{appUrl}</p>
            <p>name:{parsedTransactionData?.name}<br />
                sighash:{parsedTransactionData?.sighash}<br />
                signature:{parsedTransactionData?.signature}<br />
                value:{value ? ethers.utils.formatEther(value) : "0.0"}<br />
                data:{data}</p>

        </Modal>

    )
}

export default CalldataModal