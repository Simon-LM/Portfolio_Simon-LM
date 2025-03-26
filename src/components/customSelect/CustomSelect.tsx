/** @format */

import React, { useRef } from "react";
import { useSelectState } from "@react-stately/select";
import {
	useSelect,
	HiddenSelect,
	useButton,
	mergeProps,
} from "@react-aria/select";
import { useListBox, useOption } from "@react-aria/listbox";
import { FocusScope } from "@react-aria/focus";
import { useOverlay, DismissButton, Overlay } from "@react-aria/overlays";
import { Item } from "@react-stately/collections";

type OptionType = {
	value: string;
	label: string;
};

type CustomSelectProps = {
	label: string;
	options: OptionType[] | { label: string; options: OptionType[] }[];
	selectedKey: string;
	onChange: (key: string) => void;
	className?: string;
	id?: string;
};

// Composant principal
export function CustomSelect(props: CustomSelectProps) {
	const { label } = props;

	// Convertir les options pour React Stately
	const items = React.useMemo(() => {
		return props.options.map((option) => {
			if ("options" in option) {
				// C'est un groupe
				return {
					key: option.label,
					label: option.label,
					children: option.options.map((opt) => ({
						key: opt.value,
						label: opt.label,
					})),
				};
			} else {
				// C'est une option simple
				return {
					key: option.value,
					label: option.label,
				};
			}
		});
	}, [props.options]);

	// Setup des états et refs
	const state = useSelectState({
		...props,
		defaultSelectedKey: props.selectedKey,
		onSelectionChange: (key) => props.onChange(key as string),
		children: (item: any) => {
			if (item.children) {
				return (
					<Item key={item.key} textValue={item.label}>
						{item.children.map((child: any) => (
							<Item key={child.key}>{child.label}</Item>
						))}
					</Item>
				);
			}
			return <Item key={item.key}>{item.label}</Item>;
		},
	});

	const triggerRef = useRef<HTMLButtonElement>(null);
	const listboxRef = useRef<HTMLUListElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);

	const { triggerProps, valueProps, menuProps } = useSelect(
		props,
		state,
		triggerRef
	);

	// Ajout de la classe personnalisée
	const buttonClassName = `custom-select-button ${props.className || ""}`;

	return (
		<div className="custom-select-container">
			<div className="custom-select-label">{label}</div>
			<HiddenSelect
				state={state}
				triggerRef={triggerRef}
				label={label}
				name={props.id}
			/>
			<button {...triggerProps} ref={triggerRef} className={buttonClassName}>
				<span {...valueProps}>
					{state.selectedItem
						? state.selectedItem.rendered
						: "Select an option"}
				</span>
				<span className="custom-select-arrow">▼</span>
			</button>
			{state.isOpen && (
				<Overlay>
					<FocusScope restoreFocus autoFocus>
						<ListBox
							{...menuProps}
							listboxRef={listboxRef}
							popoverRef={popoverRef}
							state={state}
						/>
					</FocusScope>
				</Overlay>
			)}
		</div>
	);
}

// Composant de liste déroulante
function ListBox({ state, listboxRef, popoverRef, ...props }: any) {
	const { listBoxProps } = useListBox(props, state, listboxRef);

	const { overlayProps } = useOverlay(
		{
			onClose: () => state.close(),
			shouldCloseOnBlur: true,
			isOpen: state.isOpen,
			isDismissable: true,
		},
		popoverRef
	);

	return (
		<div {...overlayProps} ref={popoverRef} className="custom-select-popover">
			<DismissButton onDismiss={() => state.close()} />
			<ul {...listBoxProps} ref={listboxRef} className="custom-select-listbox">
				{[...state.collection].map((item) => (
					<Option key={item.key} item={item} state={state} />
				))}
			</ul>
			<DismissButton onDismiss={() => state.close()} />
		</div>
	);
}

// Composant d'option
function Option({ item, state }: { item: any; state: any }) {
	const ref = useRef<HTMLLIElement>(null);
	const isDisabled = state.disabledKeys.has(item.key);
	const isSelected = state.selectionManager.isSelected(item.key);

	const { optionProps } = useOption(
		{ key: item.key, isDisabled, isSelected },
		state,
		ref
	);

	return (
		<li
			{...optionProps}
			ref={ref}
			className={`custom-select-option ${isSelected ? "is-selected" : ""} ${
				isDisabled ? "is-disabled" : ""
			}`}>
			{item.rendered}
		</li>
	);
}

export default CustomSelect;
