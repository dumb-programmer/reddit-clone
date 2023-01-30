import React, { useEffect, useState } from "react";
import DeleteCommentConfirmation from "./DeleteCommentConfirmation";
import EditIcon from "./EditIcon";
import SaveIcon from "./SaveIcon";
import ShowMoreIcon from "./ShowMoreIcon";
import TrashIcon from "./TrashIcon";

const ShowMore = ({ id, onEdit }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.body.addEventListener("click", () => setShowDropdown(false));
  }, []);

  return (
    <>
      <div
        className="show-more"
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(true);
        }}
      >
        <ShowMoreIcon height={25} width={25} />
        {showDropdown && (
          <ul className="comment-dropdown">
            <li className="comment-dropdown-link">
              <SaveIcon height={30} width={30} />
              <span>Save</span>
            </li>
            <li
              className="comment-dropdown-link"
              onClick={() => {
                onEdit();
                setShowDropdown(false);
              }}
            >
              <EditIcon height={25} width={25} />
              <span>Edit</span>
            </li>
            <li
              className="comment-dropdown-link"
              onClick={() => setShowModal(true)}
            >
              <TrashIcon height={25} width={25} />
              <span>Delete</span>
            </li>
          </ul>
        )}
      </div>
      {showModal && (
        <DeleteCommentConfirmation id={id} setShowModal={setShowModal} />
      )}
    </>
  );
};

export default ShowMore;
