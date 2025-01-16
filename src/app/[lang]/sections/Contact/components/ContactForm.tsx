/** @format */

import { ContactFormProps } from "../../../../../types/components/sections";
import * as Form from "@radix-ui/react-form";
import { FormFields } from "./FormFields";

export const ContactForm = ({
	onSubmit,
	register,
	errors,
	dictionary,
	isLoading,
	lang,
}: ContactFormProps) => (
	<Form.Root className="contact__form" onSubmit={onSubmit}>
		<FormFields
			register={register}
			errors={errors}
			dictionary={dictionary}
			lang={lang}
		/>
		<Form.Submit asChild>
			<button
				className="contact__form-submit"
				type="submit"
				disabled={isLoading}
				aria-busy={isLoading}>
				{isLoading ? dictionary.form.sending : dictionary.form.submit}
			</button>
		</Form.Submit>
	</Form.Root>
);
