/** @format */

import { ErrorToastProps } from "@/types/components/sections";

export const ErrorToast = ({ dictionary }: ErrorToastProps) => (
	<div className="recaptcha-error" role="alert">
		<h3>{dictionary.form.recaptcha.error.title}</h3>
		<p>{dictionary.form.recaptcha.error.cause}</p>
		<ul>
			{dictionary.form.recaptcha.error.reasons.map((reason, index) => (
				<li key={index}>{reason}</li>
			))}
		</ul>
		<p>{dictionary.form.recaptcha.error.solutions.title}</p>
		<ul>
			{dictionary.form.recaptcha.error.solutions.items.map(
				(solution, index) => (
					<li key={index}>
						{index === 2 ? (
							<a
								href={dictionary.social.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								className="recaptcha-error__link">
								{solution}
							</a>
						) : (
							solution
						)}
					</li>
				)
			)}
		</ul>
	</div>
);
