import DeleteAccountForm from "./DeleteAccountForm";
import Modal from "./Modal";

const DeleteAccountModal = ({ onClose }) => {
  return (
    <Modal
      headerText="Delete Account"
      Body={<DeleteAccountForm onCancel={onClose} />}
      onClose={onClose}
    />
  );
};

export default DeleteAccountModal;
