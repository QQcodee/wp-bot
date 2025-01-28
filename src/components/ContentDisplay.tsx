import React from "react";

const ContentDisplay = ({ content }) => {
  return (
    <div className="mt-4 p-4 border rounded-md">
      <h3>Editor Content:</h3>
      <div
        className="editor-content-preview"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default ContentDisplay;
