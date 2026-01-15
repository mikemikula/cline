import { StringRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Fuse from "fuse.js"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useMount } from "react-use"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import { createIconButtonProps } from "@/utils/interactiveProps"
import { useListboxNavigation } from "@/utils/useListboxNavigation"
import { HighlightedText, highlight } from "../history/HistoryView"
import { getModeSpecificFields } from "./utils/providerUtils"
import { useApiConfigurationHandlers } from "./utils/useApiConfigurationHandlers"

export const HICAP_MODEL_PICKER_Z_INDEX = 1_000

// Star icon for favorites
const StarIcon = ({ isFavorite, onClick }: { isFavorite: boolean; onClick: (e: React.MouseEvent) => void }) => {
	return (
		<button
			{...createIconButtonProps(isFavorite ? "Remove from favorites" : "Add to favorites", onClick)}
			className={`cursor-pointer ${isFavorite ? "text-[var(--vscode-terminal-ansiBlue)]" : "text-[var(--vscode-descriptionForeground)]"} ml-[8px] text-[16px] flex items-center justify-center select-none`}
			type="button">
			{isFavorite ? "★" : "☆"}
		</button>
	)
}

export interface HicapModelPickerProps {
	isPopup?: boolean
	currentMode: Mode
}

const HicapModelPicker: React.FC<HicapModelPickerProps> = ({ currentMode }) => {
	const { handleModeFieldsChange } = useApiConfigurationHandlers()
	const { apiConfiguration, favoritedModelIds, hicapModels, refreshHicapModels } = useExtensionState()

	const modeFields = getModeSpecificFields(apiConfiguration, currentMode)
	const [searchTerm, setSearchTerm] = useState(modeFields.hicapModelId || "gpt-5")
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
	const dropdownListRef = useRef<HTMLDivElement>(null)

	const handleModelChange = useCallback(
		(newModelId: string) => {
			setSearchTerm(newModelId)
			handleModeFieldsChange(
				{
					hicapModelId: { plan: "planModeHicapModelId", act: "actModeHicapModelId" },
					hicapModelInfo: { plan: "planModeHicapModelInfo", act: "actModeHicapModelInfo" },
				},
				{ hicapModelId: newModelId, hicapModelInfo: {} },
				currentMode,
			)
		},
		[handleModeFieldsChange, currentMode],
	)

	useMount(refreshHicapModels)

	// Sync external changes when the modelId changes
	useEffect(() => {
		const currentModelId = modeFields.hicapModelId || "gpt-5"
		setSearchTerm(currentModelId)
	}, [modeFields.hicapModelId])

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

	const modelIds = useMemo(() => {
		const unfilteredModelIds = Object.keys(hicapModels).sort((a, b) => a.localeCompare(b))

		return unfilteredModelIds
	}, [hicapModels, modeFields.apiProvider])

	const searchableItems = useMemo(() => {
		return modelIds.map((id) => ({
			id,
			html: id,
		}))
	}, [modelIds])

	const fuse = useMemo(() => {
		return new Fuse(searchableItems, {
			keys: ["html"], // highlight function will update this
			threshold: 0.6,
			shouldSort: true,
			isCaseSensitive: false,
			ignoreLocation: false,
			includeMatches: true,
			minMatchCharLength: 1,
		})
	}, [searchableItems])

	const modelSearchResults = useMemo(() => {
		// IMPORTANT: highlightjs has a bug where if you use sort/localCompare - "// results.sort((a, b) => a.id.localeCompare(b.id)) ...sorting like this causes ids in objects to be reordered and mismatched"

		// First, get all favorited models
		const favoritedModels = searchableItems.filter((item) => favoritedModelIds.includes(item.id))

		// Then get search results for non-favorited models
		const searchResults = searchTerm
			? highlight(fuse.search(searchTerm)).filter((item) => !favoritedModelIds.includes(item.id))
			: searchableItems.filter((item) => !favoritedModelIds.includes(item.id))

		// Combine favorited models with search results
		return [...favoritedModels, ...searchResults]
	}, [searchableItems, searchTerm, fuse, favoritedModelIds])

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

	return (
		<div className="w-full">
			<div className="flex flex-col">
				<label htmlFor="model-search">
					<span className="font-medium">Model ID</span>
				</label>

				<div className="relative w-full" ref={dropdownRef}>
					<VSCodeTextField
						className="w-full relative"
						disabled={apiConfiguration?.hicapApiKey?.length !== 32 || Object.keys(hicapModels).length === 0}
						id="model-search"
						onFocus={() => setIsDropdownVisible(true)}
						onInput={(e) => {
							setSearchTerm((e.target as HTMLInputElement)?.value.toLowerCase() || "")
							setIsDropdownVisible(true)
						}}
						onKeyDown={handleKeyDown}
						placeholder="Search and select a model..."
						style={{ zIndex: HICAP_MODEL_PICKER_Z_INDEX }}
						value={searchTerm}>
						{searchTerm && (
							<button
								{...createIconButtonProps("Clear search", () => {
									setSearchTerm("")
									setIsDropdownVisible(true)
								})}
								className="flex justify-center items-center h-full input-icon-button codicon codicon-close"
								slot="end"
							/>
						)}
					</VSCodeTextField>
					{isDropdownVisible && (
						<div
							className="absolute top-[calc(100%-3px)] left-0 w-[calc(100%-2px)]
							max-h-[200px] overflow-y-auto bg-[var(--vscode-dropdown-background)]
							border border-[var(--vscode-list-activeSelectionBackground)]
							rounded-b-[3px]"
							ref={dropdownListRef}
							style={{ zIndex: HICAP_MODEL_PICKER_Z_INDEX - 1 }}>
							{modelSearchResults.map((item, index) => {
								const isFavorite = (favoritedModelIds || []).includes(item.id)
								const elRef = (el: HTMLButtonElement | null) => {
									itemRefs.current[index] = el
								}
								return (
									<button
										className={`p-[5px_10px] cursor-pointer break-all whitespace-normal text-left w-full ${
											index === selectedIndex ? "bg-[var(--vscode-list-activeSelectionBackground)]" : ""
										} hover:bg-[var(--vscode-list-activeSelectionBackground)]`}
										key={item.id}
										onClick={() => {
											handleModelChange(item.id)
											setIsDropdownVisible(false)
										}}
										onMouseEnter={() => setSelectedIndex(index)}
										ref={elRef}
										type="button">
										<div className="flex justify-between items-center">
											<HighlightedText regions={item._highlightRegions} text={item.id} />
											<StarIcon
												isFavorite={isFavorite}
												onClick={(e) => {
													e.stopPropagation()
													StateServiceClient.toggleFavoriteModel(
														StringRequest.create({ value: item.id }),
													).catch((error) => console.error("Failed to toggle favorite model:", error))
												}}
											/>
										</div>
									</button>
								)
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default HicapModelPicker
