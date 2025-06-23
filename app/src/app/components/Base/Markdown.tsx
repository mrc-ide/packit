import { useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  mdPath: string;
}
export const Markdown = ({ mdPath }: MarkdownProps) => {
  const [markdown, setMarkdown] = useState("");
  useEffect(() => {
    if (markdown === "") {
      fetch(mdPath)
        .then((response) => response.text())
        .then((text) => setMarkdown(text))
        .catch((error) => console.error("Error loading markdown:", error));
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 m-4 bg-white dark:bg-gray-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1
              className="text-3xl font-bold 
            dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2"
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2">{children}</h4>
          ),
          p: ({ children }) => <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc list-outside space-y-2 mb-4 text-gray-600 dark:text-gray-400 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol
              className="list-decimal list-outside space-y-2 mb-4
             text-gray-600 dark:text-gray-400 pl-6"
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed ml-0">{children}</li>,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>,
          th: ({ children }) => (
            <th
              className="border border-gray-300 dark:border-gray-600 
            px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300"
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className="border border-gray-300 dark:border-gray-600 
            px-4 py-3 text-gray-600 dark:text-gray-400 align-top"
            >
              {children}
            </td>
          ),
          code: ({ children, inline }) =>
            inline ? (
              <code
                className="block bg-gray-100 dark:bg-gray-800 text-gray-800 
              dark:text-gray-200 p-4 rounded-lg font-mono text-sm overflow-x-auto"
              >
                {children}
              </code>
            ) : (
              <code
                className="bg-gray-100 dark:bg-gray-800 text-gray-800
               dark:text-gray-200 px-2 py-1 rounded text-sm font-mono"
              >
                {children}
              </code>
            ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-800 dark:text-gray-200">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-gray-500 dark:text-gray-400">{children}</em>,
          hr: () => <hr className="border-gray-300 dark:border-gray-600 my-8" />,
          blockquote: ({ children }) => (
            <blockquote
              className="border-l-4 border-blue-500 
            dark:border-blue-400 pl-4 italic text-gray-600 dark:text-gray-400 my-4"
            >
              {children}
            </blockquote>
          )
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
