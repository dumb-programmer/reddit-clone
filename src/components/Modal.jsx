import CrossIcon from "./icons/CrossIcon";

const Modal = ({ headerText, Body, Footer, onClose }) => {
  return (
    <div className="modal-container">
      <div className="modal">
        <header className="modal-header">
          <h4>{headerText}</h4>
          <button className="close-modal-btn" onClick={onClose}>
            <CrossIcon height={20} width={20} stroke="black" strokeWidth={1} />
          </button>
        </header>
        <div className="modal-body">{Body}</div>
        {Footer && <footer className="modal-footer">{Footer}</footer>}
      </div>
    </div>
  );
};

export default Modal;
