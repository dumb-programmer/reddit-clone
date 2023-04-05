import React from "react";
import Modal from "./Modal";
import KeepUsernameForm from "./KeepUsernameForm";

const KeepUsernameModal = ({ username, onChangeUsername, onClose }) => {
  return (
    <Modal
      headerText="Keep username"
      Body={
        <KeepUsernameForm
          username={username}
          onChange={onChangeUsername}
          onSuccess={() => onClose()}
        />
      }
      onClose={onClose}
    />
  );
};

export default KeepUsernameModal;
