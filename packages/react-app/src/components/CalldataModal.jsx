import { Modal } from "antd"
import { ethers } from "ethers"

const CalldataModal = ({
    parsedTransactionData,
    isModalVisible,
    hideModal,
    handleOk,
    value,
    appUrl,
    data,
    appIcon
}) => {

    return (
        <Modal

            title="Accept Transaction ?"
            visible={isModalVisible}
            onOk={() => {
                hideModal()
                handleOk()
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
                value:{value ? value.toString() : ""}<br />
                data:{data}</p>

        </Modal>

    )
}

export default CalldataModal