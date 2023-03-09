import ChangeEmailForm from "./ChangeEmailForm";
import Modal from "./Modal";

const ChangeEmailModal = ({ showToast, onClose }) => {
  return (
    <Modal
      headerText="Update your email"
      Body={
        <ChangeEmailForm
          onFinish={() => {
            showToast();
            onClose();
          }}
        />
      }
      onClose={onClose}
    />
  );
};

export default ChangeEmailModal;
