import React, { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const App = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const editorRef = useRef(null);

  const API_KEY = import.meta.env.GOOGLE_API_KEY;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const generateArticle = async () => {
    if (!title) return alert("Please enter a title!");
    setLoading1(true);

    try {
      const prompt = `Write a detailed, well-structured article on the topic: "${title}". The article should include an engaging introduction, multiple informative sections, and a concise conclusion, all written in a professional and informative tone. Generate the content in clean, properly nested HTML format suitable for direct input into the TinyMCE editor. Use appropriate HTML tags such as <h1>, <h2>, <p>, <ul>, <li>, <strong>, and <em> for headings, subheadings, paragraphs, lists, bold, and italicized text. Ensure that the output is ready for integration into TinyMCE without additional modification.`;

      const result = await model.generateContent(prompt);

      const data = result.response.text();

      animateTyping(editorRef.current, data);
    } catch (error) {
      console.error("Error generating article:", error);
      alert("Error generating article. Please try again.");
    } finally {
      setLoading1(false);
    }
  };

  const optimizeArticle = async () => {
    if (!content) return alert("No content to optimize!");
    setLoading2(true);

    try {
      const prompt = `${content}\n\nImprove the following article by making it more engaging, professional, and well-structured. Ensure that the output is in clean, properly nested HTML format compatible with the TinyMCE editor. Use appropriate HTML tags such as <h1>, <h2>, <p>, <ul>, <li>, <strong>, and <em> for headings, subheadings, paragraphs, lists, bold, and italicized text. Enhance clarity, grammar, and coherence while keeping the original meaning intact. Output only the HTML content without any markdown or code block symbols.`;
      const result = await model.generateContent(prompt);
      const data = result.response.text();


      eraseTyping(editorRef.current, data);
    } catch (error) {
      console.error("Error optimizing article:", error);
      alert("Error optimizing article. Please try again.");
    } finally {
      setLoading2(false);
    }
  };

  // Typing animation
  const animateTyping = (editor, text) => {
    let index = 0;
    editor.setContent(""); // Clear editor content

    const interval = setInterval(() => {
      const currentContent = editor.getContent({ format: "html" });
      const partialContent = text.slice(0, index + 1); // Take HTML substring
      editor.setContent(partialContent);
      index++;

      if (index === text.length) {
        clearInterval(interval);
      }

      // Scroll to the bottom
      editor.selection.select(editor.getBody(), true);
      editor.selection.collapse(false);
      editor.getWin().scrollTo(0, editor.getDoc().body.scrollHeight);
    }, 10); // Adjust typing speed here
  };

  const eraseTyping = (editor, html) => {
    let index = editor.getContent({ format: "html" }).length;

    const eraseInterval = setInterval(() => {
      const currentContent = editor.getContent({ format: "html" });
      const partialContent = currentContent.slice(0, index - 1);
      editor.setContent(partialContent);
      index--;

      if (index <= 0) {
        clearInterval(eraseInterval);

        let newIndex = 0;
        const typeInterval = setInterval(() => {
          const partialNewContent = html.slice(0, newIndex + 1);
          editor.setContent(partialNewContent);
          newIndex++;

          if (newIndex === html.length) {
            clearInterval(typeInterval);
          }
        }, 10); // Typing speed in milliseconds
      }
    }, 5); // Erasing speed in milliseconds
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414]">
      <div className="w-3xl mx-auto p-6 bg-[#282828] shadow-md rounded-lg">
        <h1 className="text-2xl text-[#ffffff] font-bold mb-4 text-center">
          AI Article Writer
        </h1>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter article title..."
          className="w-full p-2 border border-gray-300 rounded-md mb-4 bg-[#3c3c3c] text-[#ffffff] placeholder-white-500"
        />

        <div className="flex space-x-4 mb-4 justify-center">
          <button
            onClick={generateArticle}
            disabled={loading1}
            className="px-4 py-2 bg-[#3c3c3c] text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading1 ? "Generating..." : "Submit"}
          </button>

          <button
            onClick={optimizeArticle}
            disabled={loading2 || !content}
            className="text-white px-4 py-2 bg-[#3c3c3c]  rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading2 ? "Optimizing..." : "Optimize"}
          </button>
        </div>
        {!title && (
          <p className="text-white text-center mb-4">
            Please enter a title to generate an article.
          </p>
        )}

        <Editor
          onInit={(evt, editor) => (editorRef.current = editor)}
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          init={{
            height: 300,
            menubar: false,
            plugins: ["lists link image code"],
            toolbar:
              "undo redo | bold italic | bullist numlist outdent indent | code",
          }}
          value={content}
          onEditorChange={(newContent) => setContent(newContent)}
        />
      </div>
    </div>
  );
};

export default App;
