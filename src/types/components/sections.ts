/** @format */

import { FormData, ContactDictionary } from "../form/contact";
import { UseFormRegister, FieldErrors } from "react-hook-form";

export interface AboutDictionary {
	title: string;
	subtitle: string;
	videoTitle: string;
}

export interface SkillsDictionary {
	title: string;
	presentation: string;
	competences: {
		frontend: { title: string; items: string[] };
		backend: { title: string; items: string[] };
		tools: { title: string; items: string[] };
		closingText: string;
	};
}
export interface PortfolioDictionary {
	title: string;
	subtitle: string;
	links: {
		github: string;
		website: string;
	};
	projects: {
		argentBank: {
			title: string;
			description: {
				short: string;
				detailed: string;
			};
			tags: string[];
			imageAlt: string;
			links: {
				github: string;
				website?: string;
			};
		};
		ninaCarducci: {
			title: string;
			description: {
				short: string;
				detailed: string;
			};
			tags: string[];
			imageAlt: string;
			links: {
				github: string;
				website?: string;
			};
		};
		kasa: {
			title: string;
			description: {
				short: string;
				detailed: string;
			};
			tags: string[];
			imageAlt: string;
			links: {
				github: string;
				website?: string;
			};
		};
	};
}

export interface ContactFormProps {
	onSubmit: (data: React.FormEvent) => void;
	register: UseFormRegister<FormData>;
	errors: FieldErrors<FormData>;
	dictionary: ContactDictionary;
	isLoading: boolean;
	lang: string;
	isBlocked: boolean;
}

export interface ErrorToastProps {
	dictionary: ContactDictionary;
}
export interface FormFieldsProps {
	register: UseFormRegister<FormData>;
	errors: FieldErrors<FormData>;
	dictionary: ContactDictionary;
	lang: string;
	isBlocked: boolean;
}
