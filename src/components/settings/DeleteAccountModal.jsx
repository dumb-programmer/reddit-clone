import DeleteEmailAccountForm from "./DeleteEmailAccountForm";
import Modal from "../Modal";
import DeleteProviderAccountForm from "./DeleteProviderAccountForm";

const DeleteAccountModal = ({ type, onClose }) => {
  return (
    <Modal
      headerText="Delete Account"
      Body={
        type === "password" ? (
          <DeleteEmailAccountForm onCancel={onClose} />
        ) : (
          <DeleteProviderAccountForm provider={type} onCancel={onClose} />
        )
      }
      onClose={onClose}
    />
  );
};

export default DeleteAccountModal;
