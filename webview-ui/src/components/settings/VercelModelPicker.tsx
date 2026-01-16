import type { ModelInfo } from "@shared/api"
import type { Mode } from "@shared/storage/types"
import { VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Fuse from "fuse.js"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useMount } from "react-use"
import styled from "styled-components"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { createIconButtonProps } from "@/utils/interactiveProps"
import { useListboxNavigation } from "@/utils/useListboxNavigation"
import { HighlightedText, highlight } from "../history/HistoryView"
import { ModelInfoView } from "./common/ModelInfoView"
import ThinkingBudgetSlider from "./ThinkingBudgetSlider"
import { getModeSpecificFields } from "./utils/providerUtils"
import { useApiConfigurationHandlers } from "./utils/useApiConfigurationHandlers"

export interface VercelModelPickerProps {
	isPopup?: boolean
	currentMode: Mode
}

const VercelModelPicker: React.FC<VercelModelPickerProps> = ({ isPopup, currentMode }) => {
	const { handleModeFieldsChange } = useApiConfigurationHandlers()
	const { apiConfiguration, vercelAiGatewayModels, refreshVercelAiGatewayModels } = useExtensionState()
	const modeFields = getModeSpecificFields(apiConfiguration, currentMode)
	// Vercel AI Gateway uses its own model fields
	const [searchTerm, setSearchTerm] = useState(modeFields.vercelAiGatewayModelId || "")
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
	const dropdownListRef = useRef<HTMLDivElement>(null)

	const handleModelChange = useCallback(
		(newModelId: string) => {
			setSearchTerm(newModelId)
			handleModeFieldsChange(
				{
					vercelAiGatewayModelId: { plan: "planModeVercelAiGatewayModelId", act: "actModeVercelAiGatewayModelId" },
					vercelAiGatewayModelInfo: {
						plan: "planModeVercelAiGatewayModelInfo",
						act: "actModeVercelAiGatewayModelInfo",
					},
				},
				{ vercelAiGatewayModelId: newModelId, vercelAiGatewayModelInfo: vercelAiGatewayModels[newModelId] },
				currentMode,
			)
		},
		[handleModeFieldsChange, vercelAiGatewayModels, currentMode],
	)

	const { selectedModelId, selectedModelInfo } = useMemo(() => {
		return {
			selectedModelId: modeFields.vercelAiGatewayModelId || "",
			selectedModelInfo: modeFields.vercelAiGatewayModelInfo as ModelInfo | undefined,
		}
	}, [modeFields.vercelAiGatewayModelId, modeFields.vercelAiGatewayModelInfo])

	useMount(refreshVercelAiGatewayModels)

	// Sync external changes when the modelId changes
	useEffect(() => {
		const currentModelId = modeFields.vercelAiGatewayModelId || ""
		setSearchTerm(currentModelId)
	}, [modeFields.vercelAiGatewayModelId])

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
		return Object.keys(vercelAiGatewayModels).sort((a, b) => a.localeCompare(b))
	}, [vercelAiGatewayModels])

	const searchableItems = useMemo(() => {
		return modelIds.map((id) => ({
			id,
			html: id,
		}))
	}, [modelIds])

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
			} else {
				handleModelChange(searchTerm)
			}
			setIsDropdownVisible(false)
		},
		[modelSearchResults, handleModelChange, searchTerm],
	)

	const closeDropdown = useCallback(() => setIsDropdownVisible(false), [])

	const { selectedIndex, setSelectedIndex, handleKeyDown } = useListboxNavigation({
		itemCount: modelSearchResults.length,
		isOpen: isDropdownVisible,
		onSelect: handleListboxSelect,
		onClose: closeDropdown,
	})

	const hasInfo = useMemo(() => {
		try {
			return modelIds.some((id) => id.toLowerCase() === searchTerm.toLowerCase())
		} catch {
			return false
		}
	}, [modelIds, searchTerm])

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

	const showBudgetSlider = useMemo(() => {
		return (
			selectedModelId?.toLowerCase().includes("claude-haiku-4.5") ||
			selectedModelId?.toLowerCase().includes("claude-4.5-haiku") ||
			selectedModelId?.toLowerCase().includes("claude-sonnet-4.5") ||
			selectedModelId?.toLowerCase().includes("claude-sonnet-4") ||
			selectedModelId?.toLowerCase().includes("claude-opus-4.1") ||
			selectedModelId?.toLowerCase().includes("claude-opus-4") ||
			selectedModelId?.toLowerCase().includes("claude-opus-4.5") ||
			selectedModelId?.toLowerCase().includes("claude-3-7-sonnet") ||
			selectedModelId?.toLowerCase().includes("claude-3.7-sonnet")
		)
	}, [selectedModelId])

	return (
		<div style={{ width: "100%", paddingBottom: 2 }}>
			<style>
				{`
				.model-item-highlight {
					background-color: var(--vscode-editor-findMatchHighlightBackground);
					color: inherit;
				}
				`}
			</style>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<label htmlFor="vercel-model-search">
					<span style={{ fontWeight: 500 }}>Model</span>
				</label>

				<DropdownWrapper ref={dropdownRef}>
					<VSCodeTextField
						id="vercel-model-search"
						onBlur={() => {
							if (searchTerm !== selectedModelId) {
								handleModelChange(searchTerm)
							}
						}}
						onFocus={() => setIsDropdownVisible(true)}
						onInput={(e) => {
							setSearchTerm((e.target as HTMLInputElement)?.value.toLowerCase() || "")
							setIsDropdownVisible(true)
						}}
						onKeyDown={handleKeyDown}
						placeholder="Search and select a model..."
						style={{
							width: "100%",
							zIndex: VERCEL_MODEL_PICKER_Z_INDEX,
							position: "relative",
						}}
						value={searchTerm}>
						{searchTerm && (
							<button
								{...createIconButtonProps("Clear search", () => {
									setSearchTerm("")
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
					{isDropdownVisible && (
						<DropdownList ref={dropdownListRef}>
							{modelSearchResults.length > 0 ? (
								modelSearchResults.map((item, index) => {
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
								})
							) : (
								<DropdownItem as="div" isSelected={false}>
									<span style={{ color: "var(--vscode-descriptionForeground)" }}>
										{Object.keys(vercelAiGatewayModels).length === 0
											? "Loading models..."
											: "No models found"}
									</span>
								</DropdownItem>
							)}
						</DropdownList>
					)}
				</DropdownWrapper>
			</div>

			{hasInfo && selectedModelInfo ? (
				<div>
					{showBudgetSlider && <ThinkingBudgetSlider currentMode={currentMode} />}

					<ModelInfoView
						isPopup={isPopup}
						modelInfo={selectedModelInfo}
						selectedModelId={selectedModelId}
						showProviderRouting={false}
					/>
				</div>
			) : (
				<p
					style={{
						fontSize: "12px",
						marginTop: 0,
						color: "var(--vscode-descriptionForeground)",
					}}>
					{Object.keys(vercelAiGatewayModels).length === 0 ? (
						<span>
							Enter your Vercel AI Gateway API key above to load available models. You can get an API key from{" "}
							<VSCodeLink
								href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai"
								style={{ display: "inline", fontSize: "inherit" }}>
								Vercel AI Gateway.
							</VSCodeLink>
						</span>
					) : (
						<span>
							Select a model from the dropdown above. The extension fetches available models from your Vercel AI
							Gateway configuration.
						</span>
					)}
				</p>
			)}
		</div>
	)
}

export default VercelModelPicker

// Dropdown styles

const DropdownWrapper = styled.div`
	position: relative;
	width: 100%;
`

export const VERCEL_MODEL_PICKER_Z_INDEX = 1_000

const DropdownList = styled.div`
	position: absolute;
	top: calc(100% - 3px);
	left: 0;
	width: calc(100% - 2px);
	max-height: 200px;
	overflow-y: auto;
	background-color: var(--vscode-dropdown-background);
	border: 1px solid var(--vscode-list-activeSelectionBackground);
	z-index: ${VERCEL_MODEL_PICKER_Z_INDEX - 1};
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
