import { AskResponseRequest } from "@shared/proto/cline/task"
import { useMemo } from "react"
import styled from "styled-components"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { TaskServiceClient } from "@/services/grpc-client"
import { useListboxNavigation } from "@/utils/useListboxNavigation"

const OptionButton = styled.button<{ isSelected?: boolean; isNotSelectable?: boolean }>`
	padding: 8px 12px;
	background: ${(props) => (props.isSelected ? "var(--vscode-focusBorder)" : CODE_BLOCK_BG_COLOR)};
	color: ${(props) => (props.isSelected ? "white" : "var(--vscode-input-foreground)")};
	border: 1px solid var(--vscode-editorGroup-border);
	border-radius: 2px;
	cursor: ${(props) => (props.isNotSelectable ? "default" : "pointer")};
	text-align: left;
	font-size: 12px;

	${(props) =>
		!props.isNotSelectable &&
		`
		&:hover {
			background: var(--vscode-focusBorder);
			color: white;
		}
	`}
`

export const OptionsButtons = ({
	options,
	selected,
	isActive,
	inputValue,
}: {
	options?: string[]
	selected?: string
	isActive?: boolean
	inputValue?: string
}) => {
	if (!options?.length) {
		return null
	}

	const hasSelected = selected !== undefined && options.includes(selected)
	const selectedIndex = useMemo(() => {
		if (!selected) return -1
		return options.findIndex((opt) => opt === selected)
	}, [selected, options])

	const handleSelect = async (index: number) => {
		if (hasSelected || !isActive) {
			return
		}
		const option = options[index]
		try {
			await TaskServiceClient.askResponse(
				AskResponseRequest.create({
					responseType: "messageResponse",
					text: option + (inputValue ? `: ${inputValue?.trim()}` : ""),
					images: [],
				}),
			)
		} catch (error) {
			console.error("Error sending option response:", error)
		}
	}

	const { selectedIndex: focusedIndex, handleKeyDown } = useListboxNavigation({
		itemCount: options.length,
		isOpen: isActive && !hasSelected,
		loop: false,
		onSelect: handleSelect,
	})

	return (
		<div
			aria-label="Select an option"
			onKeyDown={handleKeyDown}
			role="listbox"
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "8px",
			}}
			tabIndex={isActive && !hasSelected ? 0 : -1}>
			{options.map((option, index) => {
				const isSelected = option === selected
				const isFocused = focusedIndex === index
				return (
					<OptionButton
						aria-label={option}
						aria-selected={isSelected}
						className="options-button"
						id={`options-button-${index}`}
						isNotSelectable={hasSelected || !isActive}
						isSelected={isSelected}
						key={index}
						onClick={() => handleSelect(index)}
						role="option"
						tabIndex={isFocused && isActive && !hasSelected ? 0 : -1}>
						<span className="ph-no-capture">{option}</span>
					</OptionButton>
				)
			})}
		</div>
	)
}
