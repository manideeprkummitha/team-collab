import Quill from "quill";
import { useEffect, useRef, useState } from "react";

interface RendererProps {
  value: string;
}

const Renderer = ({ value }: RendererProps) => {
  const [isEmpty, setIsEmpty] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);

  // Helper function to check if a string is valid JSON
  const isValidJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (!rendererRef.current) return;

    const container = rendererRef.current;

    const quill = new Quill(document.createElement("div"), {
      theme: "snow",
    });

    quill.enable(false);

    // Check if value is valid JSON
    if (isValidJson(value)) {
      const contents = JSON.parse(value);
      quill.setContents(contents);
      
      // Check if the Quill editor is empty
      const isEmpty = quill.getText().replace(/<(.|\n)*?>/g, "").trim().length === 0;
      setIsEmpty(isEmpty);

      container.innerHTML = quill.root.innerHTML;
    } else {
      // Handle non-JSON content (e.g., plain text or other fallback)
      setIsEmpty(value.trim().length === 0);
      container.innerText = value;  // Fallback: Display as plain text
    }

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [value]);

  if (isEmpty) return null;

  return <div ref={rendererRef} className="ql-editor ql-renderer" />;
};

export default Renderer;
