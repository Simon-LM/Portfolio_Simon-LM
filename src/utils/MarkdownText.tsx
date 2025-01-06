/** @format */

import ReactMarkdown from "react-markdown";

interface MarkdownTextProps {
	text: string;
}

export default function MarkdownText({ text }: MarkdownTextProps) {
	const cleanText = text.replace(/`/g, "");
	return <ReactMarkdown>{cleanText}</ReactMarkdown>;
}
