import ChangePasswordForm from "./ChangePasswordForm";
import Modal from "../Modal";

const ChnagePasswordModal = ({ showToast, onClose }) => {
  return (
    <Modal
      headerText="Update your password"
      Body={
        <ChangePasswordForm
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

export default ChnagePasswordModal;
