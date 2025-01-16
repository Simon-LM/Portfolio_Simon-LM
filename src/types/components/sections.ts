/** @format */

import { FormData, ContactDictionary } from "../form/contact";
import { UseFormRegister, FieldErrors } from "react-hook-form";

export interface ContactFormProps {
	onSubmit: (data: React.FormEvent) => void;
	register: UseFormRegister<FormData>;
	errors: FieldErrors<FormData>;
	dictionary: ContactDictionary;
	isLoading: boolean;
	lang: string;
}

export interface ErrorToastProps {
	dictionary: ContactDictionary;
}
export interface FormFieldsProps {
	register: UseFormRegister<FormData>;
	errors: FieldErrors<FormData>;
	dictionary: ContactDictionary;
	lang: string;
}
