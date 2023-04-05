import React from "react";
import Modal from "./Modal";
import ChangeUsernameForm from "./ChangeUsernameForm";

const ChangeUsernameModal = ({ onClose }) => {
  return (
    <Modal
      headerText="Change username"
      Body={<ChangeUsernameForm onSuccess={() => onClose()} />}
      onClose={onClose}
    />
  );
};

export default ChangeUsernameModal;
