/** @format */

import { ErrorToastProps } from "@/types/components/sections";

export const ErrorToast = ({ dictionary }: ErrorToastProps) => (
	<div className="contact-error" role="alert">
		<p>{dictionary.form.error}</p>
		<p>
			<a
				href={dictionary.social.linkedin}
				target="_blank"
				rel="noopener noreferrer"
				className="contact-error__link">
				{dictionary.social.linkedin}
			</a>
		</p>
	</div>
);
