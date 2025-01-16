/** @format */

import * as Form from "@radix-ui/react-form";
import Link from "next/link";
import { FormFieldsProps } from "../../../../../types/components/sections";

export const FormFields = ({
	register,
	errors,
	dictionary,
	lang,
}: FormFieldsProps) => (
	<>
		{/* Honeypot field  */}
		<div className="sr-only" aria-hidden="true">
			<Form.Field className="contact__form-field" name="honeypot">
				<Form.Label className="contact__form-label" htmlFor="contact-honeypot">
					Ne pas remplir
				</Form.Label>
				<Form.Control asChild>
					<input
						id="contact-honeypot"
						tabIndex={-1}
						{...register("honeypot")}
						autoComplete="off"
					/>
				</Form.Control>
			</Form.Field>
		</div>

		{/* Form fields */}
		<div className="contact__form-fields">
			{/* First Name */}
			<Form.Field className="contact__form-field" name="firstName">
				<Form.Label className="contact__form-label" htmlFor="firstName">
					{dictionary.form.firstName}
				</Form.Label>
				<Form.Control asChild>
					<input
						id="firstName"
						className="contact__form-input"
						{...register("firstName")}
						aria-invalid={errors.firstName ? "true" : "false"}
						data-required="true"
					/>
				</Form.Control>
				{errors.firstName && (
					<Form.Message className="contact__form-error">
						{errors.firstName.message}
					</Form.Message>
				)}
			</Form.Field>

			{/* Last Name */}
			<Form.Field className="contact__form-field" name="lastName">
				<Form.Label className="contact__form-label" htmlFor="lastName">
					{dictionary.form.lastName}
				</Form.Label>
				<Form.Control asChild>
					<input
						id="lastName"
						className="contact__form-input"
						{...register("lastName")}
						aria-invalid={errors.lastName ? "true" : "false"}
						data-required="true"
					/>
				</Form.Control>
				{errors.lastName && (
					<Form.Message className="contact__form-error">
						{errors.lastName.message}
					</Form.Message>
				)}
			</Form.Field>

			{/* Company */}
			<Form.Field className="contact__form-field" name="company">
				<Form.Label className="contact__form-label" htmlFor="company">
					{dictionary.form.company}
					<span className="optional">{dictionary.form.optional}</span>
				</Form.Label>
				<Form.Control asChild>
					<input
						id="company"
						className="contact__form-input"
						{...register("company")}
					/>
				</Form.Control>
			</Form.Field>

			{/* Phone */}
			<Form.Field className="contact__form-field" name="phone">
				<Form.Label className="contact__form-label" htmlFor="phone">
					{dictionary.form.phone}
					<span className="optional">{dictionary.form.optional}</span>
				</Form.Label>
				<Form.Control asChild>
					<input
						id="phone"
						type="tel"
						className="contact__form-input"
						{...register("phone")}
						aria-invalid={errors.phone ? "true" : "false"}
						// Correction du pattern en échappant les caractères spéciaux
						pattern="^(?:(?:\+|00)33|0)\s*[1-9](?:[\s\.\-]*\d{2}){4}$"
						aria-describedby="phone-format"
					/>
				</Form.Control>
				<div id="phone-format" className="contact__form-hint-phones">
					<div className="contact__form-hint">
						{dictionary.form.phoneFormat.line1}
					</div>
					<div className="contact__form-hint">
						{dictionary.form.phoneFormat.line2}
					</div>
				</div>
				{errors.phone && (
					<Form.Message className="contact__form-error">
						{errors.phone.message}
					</Form.Message>
				)}
			</Form.Field>

			{/* Email */}
			<Form.Field
				className="contact__form-field contact__form-field-email"
				name="email">
				<Form.Label className="contact__form-label" htmlFor="email">
					{dictionary.form.email}
				</Form.Label>
				<Form.Control asChild>
					<input
						id="email"
						type="email"
						className="contact__form-input"
						{...register("email")}
						aria-invalid={errors.email ? "true" : "false"}
						aria-describedby="email-format"
						data-required="true"
					/>
				</Form.Control>
				<div id="email-format" className="contact__form-hint">
					{dictionary.form.emailFormat}
				</div>
				{errors.email && (
					<Form.Message className="contact__form-error">
						{errors.email.message}
					</Form.Message>
				)}
			</Form.Field>
		</div>

		{/* Subject */}
		<Form.Field className="contact__form-field" name="subject">
			<Form.Label className="contact__form-label" htmlFor="subject">
				{dictionary.form.subject}
			</Form.Label>
			<Form.Control asChild>
				<input
					id="subject"
					className="contact__form-input"
					{...register("subject")}
					aria-invalid={errors.subject ? "true" : "false"}
					data-required="true"
				/>
			</Form.Control>
			{errors.subject && (
				<Form.Message className="contact__form-error">
					{errors.subject.message}
				</Form.Message>
			)}
		</Form.Field>

		{/* Message */}
		<Form.Field
			className="contact__form-field contact__form-field-textarea"
			name="message">
			<Form.Label className="contact__form-label" htmlFor="message">
				{dictionary.form.message}
			</Form.Label>
			<Form.Control asChild>
				<textarea
					id="message"
					className="contact__form-textarea"
					{...register("message")}
					aria-invalid={errors.message ? "true" : "false"}
					data-required="true"
				/>
			</Form.Control>
			{errors.message && (
				<Form.Message className="contact__form-error">
					{errors.message.message}
				</Form.Message>
			)}
		</Form.Field>

		{/* GDPR Consent */}
		<Form.Field
			className="contact__form-field contact__form-field--checkbox"
			name="gdprConsent">
			<div className="contact__form-gdpr-text">
				<p>
					{dictionary.form.gdpr.text}{" "}
					<Link
						href={`/${lang}/privacy-policy`} // Ajouter le paramètre de langue
						className="contact__form-gdpr-link">
						{dictionary.form.gdpr.privacyLink}
					</Link>
				</p>
			</div>
			<div className="contact__form-gdpr-consent">
				<Form.Control asChild>
					<input
						id="gdprConsent"
						type="checkbox"
						{...register("gdprConsent")}
						aria-invalid={errors.gdprConsent ? "true" : "false"}
					/>
				</Form.Control>
				<Form.Label className="contact__form-label" htmlFor="gdprConsent">
					{dictionary.form.gdpr.checkbox}
				</Form.Label>
			</div>
			{errors.gdprConsent && (
				<Form.Message className="contact__form-error">
					{errors.gdprConsent.message}
				</Form.Message>
			)}
		</Form.Field>
	</>
);
