import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Fuse from "fuse.js"
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import styled from "styled-components"
import { createIconButtonProps } from "@/utils/interactiveProps"
import { useListboxNavigation } from "@/utils/useListboxNavigation"
import { HighlightedText, highlight } from "../history/HistoryView"

export const OLLAMA_MODEL_PICKER_Z_INDEX = 1_000

export interface OllamaModelPickerProps {
	ollamaModels: string[]
	selectedModelId: string
	onModelChange: (modelId: string) => void
	placeholder?: string
}

const OllamaModelPicker: React.FC<OllamaModelPickerProps> = ({
	ollamaModels,
	selectedModelId,
	onModelChange,
	placeholder = "Search and select a model...",
}) => {
	const [searchTerm, setSearchTerm] = useState(selectedModelId || "")
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
	const dropdownListRef = useRef<HTMLDivElement>(null)

	const handleModelChange = useCallback(
		(newModelId: string) => {
			onModelChange(newModelId)
			setSearchTerm(newModelId)
		},
		[onModelChange],
	)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownVisible(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	const searchableItems = useMemo(() => {
		return ollamaModels.map((id) => ({
			id,
			html: id,
		}))
	}, [ollamaModels])

	const fuse = useMemo(() => {
		return new Fuse(searchableItems, {
			keys: ["html"],
			threshold: 0.6,
			shouldSort: true,
			isCaseSensitive: false,
			ignoreLocation: false,
			includeMatches: true,
			minMatchCharLength: 1,
		})
	}, [searchableItems])

	const modelSearchResults = useMemo(() => {
		return searchTerm
			? highlight(fuse.search(searchTerm))
			: searchableItems.map((item) => ({ ...item, highlightRegions: [] as [number, number][] }))
	}, [searchableItems, searchTerm, fuse])

	const handleListboxSelect = useCallback(
		(index: number) => {
			if (index >= 0 && index < modelSearchResults.length) {
				handleModelChange(modelSearchResults[index].id)
				setIsDropdownVisible(false)
			}
		},
		[modelSearchResults, handleModelChange],
	)

	const closeDropdown = useCallback(() => setIsDropdownVisible(false), [])

	const { selectedIndex, setSelectedIndex, handleKeyDown } = useListboxNavigation({
		itemCount: modelSearchResults.length,
		isOpen: isDropdownVisible,
		onSelect: handleListboxSelect,
		onClose: closeDropdown,
	})

	useEffect(() => {
		setSelectedIndex(0)
		if (dropdownListRef.current) {
			dropdownListRef.current.scrollTop = 0
		}
	}, [searchTerm, setSelectedIndex])

	useEffect(() => {
		if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
			itemRefs.current[selectedIndex]?.scrollIntoView({
				block: "nearest",
				behavior: "smooth",
			})
		}
	}, [selectedIndex])

	// Update search term when selectedModelId changes externally
	useEffect(() => {
		if (selectedModelId !== searchTerm) {
			setSearchTerm(selectedModelId || "")
		}
	}, [selectedModelId])

	return (
		<div style={{ width: "100%" }}>
			<style>
				{`
				.ollama-model-item-highlight {
					background-color: var(--vscode-editor-findMatchHighlightBackground);
					color: inherit;
				}
				`}
			</style>
			<DropdownWrapper ref={dropdownRef}>
				<VSCodeTextField
					id="ollama-model-search"
					onFocus={() => setIsDropdownVisible(true)}
					onInput={(e) => {
						const value = (e.target as HTMLInputElement)?.value || ""
						handleModelChange(value)
						setIsDropdownVisible(true)
					}}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					style={{
						width: "100%",
						zIndex: OLLAMA_MODEL_PICKER_Z_INDEX,
						position: "relative",
					}}
					value={searchTerm}>
					{searchTerm && (
						<button
							{...createIconButtonProps("Clear search", () => {
								handleModelChange("")
								setIsDropdownVisible(true)
							})}
							className="input-icon-button codicon codicon-close"
							slot="end"
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: "100%",
							}}
							type="button"
						/>
					)}
				</VSCodeTextField>
				{isDropdownVisible && modelSearchResults.length > 0 && (
					<DropdownList ref={dropdownListRef}>
						{modelSearchResults.map((item, index) => {
							const elRef = (el: HTMLButtonElement | null) => {
								itemRefs.current[index] = el
							}
							return (
								<DropdownItem
									as="button"
									isSelected={index === selectedIndex}
									key={item.id}
									onClick={() => {
										handleModelChange(item.id)
										setIsDropdownVisible(false)
									}}
									onMouseEnter={() => setSelectedIndex(index)}
									ref={elRef}
									type="button">
									<HighlightedText regions={item.highlightRegions} text={item.id} />
								</DropdownItem>
							)
						})}
					</DropdownList>
				)}
			</DropdownWrapper>
		</div>
	)
}

export default memo(OllamaModelPicker)

// Dropdown styling

const DropdownWrapper = styled.div`
	position: relative;
	width: 100%;
`

const DropdownList = styled.div`
	position: absolute;
	top: calc(100% - 3px);
	left: 0;
	width: calc(100% - 2px);
	max-height: 200px;
	overflow-y: auto;
	background-color: var(--vscode-dropdown-background);
	border: 1px solid var(--vscode-list-activeSelectionBackground);
	z-index: ${OLLAMA_MODEL_PICKER_Z_INDEX - 1};
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
`

const DropdownItem = styled.button<{ isSelected: boolean }>`
	padding: 5px 10px;
	cursor: pointer;
	word-break: break-all;
	white-space: normal;
	text-align: left;
	width: 100%;
	border: none;
	background-color: ${({ isSelected }) => (isSelected ? "var(--vscode-list-activeSelectionBackground)" : "inherit")};

	&:hover {
		background-color: var(--vscode-list-activeSelectionBackground);
	}
`
