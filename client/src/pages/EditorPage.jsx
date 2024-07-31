import { createContext, useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../App";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const EditorContent = createContext({});

const EditorPage = () => {
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  return (
    <EditorContent.Provider
      value={{
        blog,
        setBlog,
        setEditorState,
        editorState,
        textEditor,
        setTextEditor,
      }}
    >
      {access_token === null ? (
        <Navigate to={"/signin"} />
      ) : editorState == "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContent.Provider>
  );
};

export default EditorPage;
