import { useContext } from "react";
import { EditorContent } from "../pages/EditorPage";

const Tags = ({ tag }) => {
  let {
    blog,
    blog: { tags },
    setBlog,
  } = useContext(EditorContent);

  const addEditable = () => {
    e.target.setAttribute("contentEditable", "true");
    e.target.focus();
  };

  const handleTagEdit = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();
      let currentTag = e.target.innerText;
      tags[tagIndex] = currentTag;
      setBlog({ ...blog, tags });

      e.target.setAttribute("contentEditable", false);
    }
  };
  const handleTagDelect = () => {
    tags = tags.filter((t) => t !== tag);
    setBlog({ ...blog, tags });
  };
  return (
    <div
      className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10
    "
    >
      <p
        className="outline-none"
        contentEditable="true"
        onKeyDown={handleTagEdit}
        onClick={addEditable}
      >
        {tag}
      </p>
      <button
        className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
        onClick={handleTagDelect}
      >
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default Tags;
