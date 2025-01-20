/** @format */

import { ContactFormProps } from "@/types/components/sections";
import * as Form from "@radix-ui/react-form";
import { FormFields } from "./FormFields";

export const ContactForm = ({
	onSubmit,
	register,
	errors,
	dictionary,
	isLoading,
	lang,
	isBlocked,
}: ContactFormProps) => (
	<Form.Root className="contact__form" onSubmit={onSubmit}>
		<FormFields
			register={register}
			errors={errors}
			dictionary={dictionary}
			lang={lang}
			isBlocked={isBlocked}
		/>
		<Form.Submit asChild>
			<button
				className="contact__form-submit"
				type="submit"
				disabled={isLoading || isBlocked}
				tabIndex={isBlocked ? -1 : 0}
				aria-busy={isLoading}>
				{isLoading ? dictionary.form.sending : dictionary.form.submit}
			</button>
		</Form.Submit>
	</Form.Root>
);
