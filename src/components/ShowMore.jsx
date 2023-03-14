import { useEffect, useState } from "react";
import { saveContent, unsaveContent } from "../firebase";
import useAuthContext from "../hooks/useAuthContext";
import useRedirect from "../hooks/useRedirect";
import DeleteConfirmation from "./DeleteConfirmation";
import EditIcon from "./icons/EditIcon";
import SaveIcon from "./icons/SaveIcon";
import ShowMoreIcon from "./icons/ShowMoreIcon";
import TrashIcon from "./icons/TrashIcon";

const ShowMore = ({
  id,
  isSaved,
  context,
  confirmationText,
  confirmationHeader,
  onEdit,
  handleDelete,
  showToast,
  isOwner,
  isMedia,
  setToastText,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const auth = useAuthContext();
  const redirectToLogin = useRedirect("/login", "You need to login first");

  const handleSave = async () => {
    if (!isSaved) {
      await saveContent(auth.uid, id);
      if (context === "comment") {
        setToastText("Comment saved successfully");
      } else if (context === "post") {
        setToastText("Post saved successfully");
      }
    } else {
      await unsaveContent(auth.uid, id);
      if (context === "comment") {
        setToastText("Comment unsaved successfully");
      } else if (context === "post") {
        setToastText("Post unsaved successfully");
      }
    }
    showToast();
  };

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
            <li
              className="comment-dropdown-link"
              onClick={auth ? handleSave : redirectToLogin}
            >
              <SaveIcon height={30} width={30} />
              <span>{isSaved ? "Unsave" : "Save"}</span>
            </li>
            {isOwner && (
              <>
                {!isMedia && (
                  <li
                    className="comment-dropdown-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowDropdown(false);
                    }}
                  >
                    <EditIcon height={25} width={25} />
                    <span>Edit</span>
                  </li>
                )}
                <li
                  className="comment-dropdown-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    setShowModal(true);
                  }}
                >
                  <TrashIcon height={25} width={25} />
                  <span>Delete</span>
                </li>
              </>
            )}
          </ul>
        )}
      </div>
      {showModal && (
        <DeleteConfirmation
          text={confirmationText}
          header={confirmationHeader}
          handleDelete={handleDelete}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
};

export default ShowMore;
