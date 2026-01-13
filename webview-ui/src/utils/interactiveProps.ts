import type {
	BaseButtonProps,
	ExternalLinkProps,
	FocusTrapOptions,
	IconButtonProps,
	InputProps,
	InputValidationState,
	InteractiveDivModalTriggerProps,
	InteractiveDivProps,
	LinkButtonProps,
	LinkProps,
	ListboxOptionProps,
	ListboxProps,
	ModalTriggerButtonProps,
	SelectProps,
	SwitchButtonProps,
	TabButtonProps,
	TabListProps,
	TabNavigationOptions,
	TabPanelProps,
	ToggleButtonProps,
} from "../types/interactive"
import { InteractiveStyles } from "../types/interactive"

// Re-export types for convenience
export type {
	ExternalLinkProps,
	FocusTrapOptions,
	InputProps,
	InputValidationState,
	InteractiveDivModalTriggerProps,
	InteractiveDivProps,
	LinkProps,
	ListboxOptionProps,
	ListboxProps,
	SelectProps,
	TabListProps,
	TabNavigationOptions,
	TabPanelProps,
}

// ============================================================================
// KEYBOARD NAVIGATION UTILITIES
// ============================================================================

/**
 * Creates a keyboard event handler for Enter and Space key activation.
 *
 * Native buttons already handle Enter/Space, but this is useful for
 * custom elements with role="button" or for adding additional keyboard shortcuts.
 *
 * @param handler - Function to call when Enter or Space is pressed
 * @returns Keyboard event handler
 */
export const createKeyboardActivationHandler =
	(handler: () => void): React.KeyboardEventHandler<HTMLElement> =>
	(e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			handler()
		}
	}

/**
 * Creates a keyboard event handler for arrow key navigation within a group.
 *
 * Use this for tab lists, menu items, radio groups, and other composite widgets
 * that require arrow key navigation per WCAG guidelines.
 *
 * @param options - Navigation configuration
 * @returns Keyboard event handler
 *
 * @example
 * ```tsx
 * const handleKeyDown = createArrowKeyNavigationHandler({
 *   onNext: () => focusNextTab(),
 *   onPrev: () => focusPrevTab(),
 *   onFirst: () => focusFirstTab(),
 *   onLast: () => focusLastTab(),
 *   orientation: "horizontal"
 * })
 * ```
 */
export const createArrowKeyNavigationHandler =
	(options: {
		/** Called when navigating to next item (Right arrow for horizontal, Down for vertical) */
		onNext?: () => void
		/** Called when navigating to previous item (Left arrow for horizontal, Up for vertical) */
		onPrev?: () => void
		/** Called when Home key is pressed */
		onFirst?: () => void
		/** Called when End key is pressed */
		onLast?: () => void
		/** Navigation direction - determines which arrow keys to use */
		orientation?: "horizontal" | "vertical" | "both"
		/** Whether to wrap from last to first and vice versa */
		wrap?: boolean
	}): React.KeyboardEventHandler<HTMLElement> =>
	(e) => {
		const { onNext, onPrev, onFirst, onLast, orientation = "horizontal" } = options

		const isHorizontal = orientation === "horizontal" || orientation === "both"
		const isVertical = orientation === "vertical" || orientation === "both"

		switch (e.key) {
			case "ArrowRight":
				if (isHorizontal && onNext) {
					e.preventDefault()
					onNext()
				}
				break
			case "ArrowLeft":
				if (isHorizontal && onPrev) {
					e.preventDefault()
					onPrev()
				}
				break
			case "ArrowDown":
				if (isVertical && onNext) {
					e.preventDefault()
					onNext()
				}
				break
			case "ArrowUp":
				if (isVertical && onPrev) {
					e.preventDefault()
					onPrev()
				}
				break
			case "Home":
				if (onFirst) {
					e.preventDefault()
					onFirst()
				}
				break
			case "End":
				if (onLast) {
					e.preventDefault()
					onLast()
				}
				break
		}
	}

/**
 * Creates a keyboard event handler for Escape key to close/dismiss.
 *
 * Use this for modals, dropdowns, menus, and other dismissible UI elements.
 *
 * @param onEscape - Function to call when Escape is pressed
 * @returns Keyboard event handler
 */
export const createEscapeHandler =
	(onEscape: () => void): React.KeyboardEventHandler<HTMLElement> =>
	(e) => {
		if (e.key === "Escape") {
			e.preventDefault()
			onEscape()
		}
	}

/**
 * Combines multiple keyboard event handlers into one.
 *
 * @param handlers - Array of keyboard event handlers to combine
 * @returns Combined keyboard event handler that calls all handlers
 *
 * @example
 * ```tsx
 * const handleKeyDown = combineKeyboardHandlers(
 *   createArrowKeyNavigationHandler({ onNext, onPrev }),
 *   createEscapeHandler(onClose)
 * )
 * ```
 */
export const combineKeyboardHandlers =
	(...handlers: (React.KeyboardEventHandler<HTMLElement> | undefined)[]): React.KeyboardEventHandler<HTMLElement> =>
	(e) => {
		for (const handler of handlers) {
			if (handler) {
				handler(e)
			}
		}
	}

// ============================================================================
// BUTTON PROP CREATORS
// ============================================================================

/**
 * Creates base button props with required accessibility attributes.
 *
 * This is the foundation utility for creating type-safe button elements with
 * proper ARIA attributes enforced at compile time.
 *
 * @param ariaLabel - Accessible label for screen readers (required for accessibility)
 * @param onClick - Click event handler function
 * @param type - HTML button type attribute (default: "button")
 * @returns Fully typed button props extending React.ButtonHTMLAttributes
 *
 * @example
 * ```tsx
 * const buttonProps = createBaseButtonProps("Close dialog", handleClose)
 * <button {...buttonProps}>Close</button>
 * ```
 */
export const createBaseButtonProps = (
	ariaLabel: string,
	onClick: React.MouseEventHandler<HTMLButtonElement>,
	type: "button" | "submit" | "reset" = "button",
): BaseButtonProps => ({
	type,
	"aria-label": ariaLabel,
	onClick,
})

/**
 * Creates toggle button props for expandable/collapsible elements.
 *
 * Use this for accordions, dropdowns, collapsible sections, and any element
 * that can be expanded or collapsed. Automatically manages aria-expanded attribute.
 *
 * Keyboard support:
 * - Enter/Space: Toggle expanded state (handled natively by button)
 * - Escape: Collapse if expanded (optional, when collapseOnEscape is true)
 *
 * @param isExpanded - Current expanded/collapsed state
 * @param onToggle - Toggle handler function called on click
 * @param ariaLabel - Accessible label (optional, defaults to "Expand"/"Collapse" based on state)
 * @param collapseOnEscape - If true, pressing Escape will collapse when expanded (default: false)
 * @returns Typed toggle button props with aria-expanded attribute
 *
 * @example
 * ```tsx
 * const [isExpanded, setIsExpanded] = useState(false)
 * const buttonProps = {
 *   ...createToggleButtonProps(
 *     isExpanded,
 *     () => setIsExpanded(!isExpanded),
 *     "Toggle section",
 *     true // collapse on Escape
 *   ),
 *   style: createButtonStyle.fullWidthFlex()
 * }
 * <button {...buttonProps}>Content</button>
 * ```
 */
export const createToggleButtonProps = (
	isExpanded: boolean,
	onToggle: () => void,
	ariaLabel?: string,
	collapseOnEscape?: boolean,
): ToggleButtonProps => {
	const props: ToggleButtonProps = {
		type: "button",
		"aria-expanded": isExpanded,
		"aria-label": ariaLabel || (isExpanded ? "Collapse" : "Expand"),
		onClick: onToggle,
	}

	// Add Escape key handler to collapse when expanded
	if (collapseOnEscape && isExpanded) {
		props.onKeyDown = createEscapeHandler(onToggle)
	}

	return props
}

/**
 * Creates icon button props with required accessibility.
 *
 * Use this for icon-only buttons (no visible text label). The aria-label is
 * required to ensure screen reader users can understand the button's purpose.
 *
 * @param ariaLabel - Accessible label describing the button action (required)
 * @param onClick - Click event handler function
 * @returns Typed icon button props
 *
 * @example
 * ```tsx
 * const closeButtonProps = {
 *   ...createIconButtonProps("Close panel", handleClose),
 *   style: createButtonStyle.icon({ padding: "4px" })
 * }
 * <button {...closeButtonProps} className="codicon codicon-close" />
 * ```
 */
export const createIconButtonProps = (
	ariaLabel: string,
	onClick: React.MouseEventHandler<HTMLButtonElement>,
): IconButtonProps => ({
	type: "button",
	"aria-label": ariaLabel,
	onClick,
})

/**
 * Creates link-styled button props.
 *
 * Use this for buttons that should look like links but maintain button semantics.
 * Prevents use of href attribute to ensure proper button behavior.
 *
 * @param ariaLabel - Accessible label for screen readers
 * @param onClick - Click event handler function
 * @returns Typed link button props
 *
 * @example
 * ```tsx
 * const linkButtonProps = createLinkButtonProps("View details", handleViewDetails)
 * <button {...linkButtonProps} className="text-link underline">View Details</button>
 * ```
 */
export const createLinkButtonProps = (
	ariaLabel: string,
	onClick: React.MouseEventHandler<HTMLButtonElement>,
): LinkButtonProps => ({
	type: "button",
	"aria-label": ariaLabel,
	onClick,
})

/**
 * Creates modal trigger button props with proper ARIA attributes.
 *
 * Use this for buttons that open modals, dialogs, menus, or other popup elements.
 * Automatically adds aria-haspopup and optionally aria-controls attributes.
 *
 * Keyboard support:
 * - Enter/Space: Open modal (handled natively by button)
 * - Escape: Close modal (optional, when onEscape is provided)
 *
 * @param ariaLabel - Accessible label describing the button action
 * @param onClick - Click event handler function
 * @param options - Optional configuration
 * @returns Typed modal trigger button props with ARIA popup attributes
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * const modalButtonProps = createModalTriggerButtonProps(
 *   "Open settings",
 *   () => setIsOpen(true),
 *   {
 *     modalId: "settings-modal",
 *     popupType: "dialog",
 *     onEscape: () => setIsOpen(false)
 *   }
 * )
 * <button {...modalButtonProps}>Settings</button>
 * ```
 */
export const createModalTriggerButtonProps = (
	ariaLabel: string,
	onClick: React.MouseEventHandler<HTMLButtonElement>,
	options?: {
		modalId?: string
		popupType?: "dialog" | "menu" | "listbox" | "tree" | "grid" | true
		onEscape?: () => void
	},
): ModalTriggerButtonProps => {
	const { modalId, popupType = "dialog", onEscape } = options || {}

	const props: ModalTriggerButtonProps = {
		type: "button",
		"aria-label": ariaLabel,
		"aria-haspopup": popupType,
		...(modalId && { "aria-controls": modalId }),
		onClick,
	}

	if (onEscape) {
		props.onKeyDown = createEscapeHandler(onEscape)
	}

	return props
}

/**
 * Creates tab button props for tab navigation with full keyboard support.
 *
 * Use this for tab navigation patterns. Automatically manages aria-selected,
 * aria-controls, tabIndex, and arrow key navigation per WCAG guidelines.
 *
 * Keyboard support:
 * - Arrow Left/Right (horizontal) or Up/Down (vertical): Navigate between tabs
 * - Home: Jump to first tab
 * - End: Jump to last tab
 * - Enter/Space: Activate tab (handled natively by button)
 *
 * @param ariaLabel - Accessible label for the tab
 * @param isSelected - Whether this tab is currently selected/active
 * @param panelId - ID of the tab panel this tab controls
 * @param onClick - Click event handler function
 * @param keyboardNav - Optional keyboard navigation handlers
 * @returns Typed tab button props with proper ARIA tab attributes and keyboard support
 *
 * @example
 * ```tsx
 * const tabs = ["tab1", "tab2", "tab3"]
 * const [activeTab, setActiveTab] = useState("tab1")
 * const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
 *
 * const getTabProps = (tabId: string, index: number) => createTabButtonProps(
 *   tabId,
 *   activeTab === tabId,
 *   `panel-${tabId}`,
 *   () => setActiveTab(tabId),
 *   {
 *     onNext: () => {
 *       const nextIndex = (index + 1) % tabs.length
 *       tabRefs.current[nextIndex]?.focus()
 *     },
 *     onPrev: () => {
 *       const prevIndex = (index - 1 + tabs.length) % tabs.length
 *       tabRefs.current[prevIndex]?.focus()
 *     }
 *   }
 * )
 * ```
 */
export const createTabButtonProps = (
	ariaLabel: string,
	isSelected: boolean,
	panelId: string,
	onClick: React.MouseEventHandler<HTMLButtonElement>,
	keyboardNav?: TabNavigationOptions,
): TabButtonProps => {
	const baseProps: TabButtonProps = {
		type: "button",
		role: "tab",
		"aria-label": ariaLabel,
		"aria-selected": isSelected,
		"aria-controls": panelId,
		tabIndex: isSelected ? 0 : -1,
		onClick,
	}

	// Add keyboard navigation if provided
	if (keyboardNav) {
		const { onNext, onPrev, onFirst, onLast, orientation = "horizontal" } = keyboardNav
		baseProps.onKeyDown = createArrowKeyNavigationHandler({
			onNext,
			onPrev,
			onFirst,
			onLast,
			orientation,
		})
	}

	return baseProps
}

/**
 * Creates switch button props for toggle switches.
 *
 * Use this for on/off toggle switches that maintain button semantics.
 * Automatically manages aria-checked attribute and provides type-safe toggle handler.
 *
 * @param ariaLabel - Accessible label describing what the switch controls
 * @param isChecked - Current checked/on state
 * @param onToggle - Toggle handler function receiving the new state
 * @returns Typed switch button props with role="switch" and aria-checked
 *
 * @example
 * ```tsx
 * const [isEnabled, setIsEnabled] = useState(false)
 * const switchProps = createSwitchButtonProps(
 *   "Enable dark mode",
 *   isEnabled,
 *   setIsEnabled
 * )
 * <button {...switchProps}>
 *   {isEnabled ? "On" : "Off"}
 * </button>
 * ```
 */
export const createSwitchButtonProps = (
	ariaLabel: string,
	isChecked: boolean,
	onToggle: (checked: boolean) => void,
): SwitchButtonProps => ({
	type: "button",
	role: "switch",
	"aria-label": ariaLabel,
	"aria-checked": isChecked,
	onClick: () => onToggle(!isChecked),
})

// ============================================================================
// TAB LIST & PANEL PROP CREATORS
// ============================================================================

/**
 * Creates tablist container props for tab navigation.
 *
 * Use this for the container element that holds tab buttons.
 * Required for proper screen reader context.
 *
 * @param ariaLabel - Accessible label for the tab group
 * @param orientation - Tab orientation (default: "horizontal")
 * @returns Typed tablist props
 *
 * @example
 * ```tsx
 * <div {...createTabListProps("Settings tabs")}>
 *   <button {...createTabButtonProps(...)}>Tab 1</button>
 *   <button {...createTabButtonProps(...)}>Tab 2</button>
 * </div>
 * ```
 */
export const createTabListProps = (ariaLabel: string, orientation: "horizontal" | "vertical" = "horizontal"): TabListProps => ({
	role: "tablist",
	"aria-label": ariaLabel,
	"aria-orientation": orientation,
})

/**
 * Creates tab panel props for content controlled by a tab.
 *
 * Use this for content panels that are shown/hidden by tabs.
 * Links panel to its controlling tab for screen readers.
 *
 * @param panelId - Unique ID for this panel (used by tab's aria-controls)
 * @param tabId - ID of the controlling tab
 * @param isVisible - Whether this panel is currently visible
 * @returns Typed tab panel props
 *
 * @example
 * ```tsx
 * <div {...createTabPanelProps("panel-settings", "tab-settings", activeTab === "settings")}>
 *   Panel content here
 * </div>
 * ```
 */
export const createTabPanelProps = (panelId: string, tabId: string, isVisible: boolean): TabPanelProps => ({
	role: "tabpanel",
	id: panelId,
	"aria-labelledby": tabId,
	tabIndex: isVisible ? 0 : -1,
	hidden: !isVisible,
})

// ============================================================================
// LISTBOX & OPTION PROP CREATORS
// ============================================================================

/**
 * Creates listbox container props for dropdown menus and selection lists.
 *
 * Use for combobox popups, context menus, and selection dropdowns.
 * Manages virtual focus via aria-activedescendant.
 *
 * @param ariaLabel - Accessible label for the listbox
 * @param activeDescendantId - ID of the currently focused option (optional)
 * @returns Typed listbox props
 *
 * @example
 * ```tsx
 * <div {...createListboxProps("Context mentions", `option-${selectedIndex}`)}>
 *   {options.map((opt, i) => (
 *     <div {...createListboxOptionProps(opt.label, i === selectedIndex, `option-${i}`, onClick)} />
 *   ))}
 * </div>
 * ```
 */
export const createListboxProps = (ariaLabel: string, activeDescendantId?: string): ListboxProps => ({
	role: "listbox",
	"aria-label": ariaLabel,
	"aria-activedescendant": activeDescendantId,
	tabIndex: 0,
})

/**
 * Creates listbox option props for selectable items.
 *
 * Use for individual options within a listbox. Includes keyboard
 * support for Enter/Space activation.
 *
 * @param ariaLabel - Accessible label for the option
 * @param isSelected - Whether this option is currently selected
 * @param id - Unique ID for aria-activedescendant reference
 * @param onSelect - Handler called when option is selected
 * @param isDisabled - Whether the option is disabled (optional)
 * @returns Typed listbox option props with keyboard handler
 *
 * @example
 * ```tsx
 * <div {...createListboxOptionProps("File: README.md", index === selectedIndex, `option-${index}`, () => handleSelect(item))}>
 *   {item.label}
 * </div>
 * ```
 */
export const createListboxOptionProps = (
	ariaLabel: string,
	isSelected: boolean,
	id: string,
	onSelect: () => void,
	isDisabled?: boolean,
): ListboxOptionProps & { onClick: () => void; onKeyDown: React.KeyboardEventHandler<HTMLElement> } => ({
	role: "option",
	"aria-label": ariaLabel,
	"aria-selected": isSelected,
	id,
	tabIndex: isSelected ? 0 : -1,
	onClick: isDisabled ? () => {} : onSelect,
	onKeyDown: isDisabled ? () => {} : createKeyboardActivationHandler(onSelect),
})

// ============================================================================
// INTERACTIVE DIV PROP CREATORS
// ============================================================================

/**
 * Creates props for a div element used as an interactive button.
 *
 * Use when a native button element isn't suitable (e.g., wrapping complex
 * children). Includes role="button", tabIndex, and keyboard handler.
 *
 * @param ariaLabel - Accessible label for screen readers
 * @param onClick - Click handler function
 * @returns Typed props for interactive div
 *
 * @example
 * ```tsx
 * <div {...createInteractiveDivProps("Edit message", handleClick)}>
 *   {complexChildren}
 * </div>
 * ```
 */
export const createInteractiveDivProps = (ariaLabel: string, onClick: () => void): InteractiveDivProps => ({
	role: "button",
	"aria-label": ariaLabel,
	tabIndex: 0,
	onClick,
	onKeyDown: createKeyboardActivationHandler(onClick),
})

/**
 * Creates props for a div element that triggers a modal/popup.
 *
 * Extends interactive div props with aria-haspopup and aria-expanded.
 * Use for modal triggers that wrap complex children.
 *
 * @param ariaLabel - Accessible label for screen readers
 * @param onClick - Click handler function
 * @param isExpanded - Current expanded state (optional)
 * @param popupType - Type of popup being triggered (default: "dialog")
 * @returns Typed props for modal trigger div
 *
 * @example
 * ```tsx
 * <div {...createInteractiveDivModalTriggerProps("Open menu", handleClick, isOpen, "menu")}>
 *   {triggerContent}
 * </div>
 * ```
 */
export const createInteractiveDivModalTriggerProps = (
	ariaLabel: string,
	onClick: () => void,
	isExpanded?: boolean,
	popupType: "dialog" | "menu" | "listbox" | "tree" | "grid" | true = "dialog",
): InteractiveDivModalTriggerProps => ({
	role: "button",
	"aria-label": ariaLabel,
	"aria-haspopup": popupType,
	"aria-expanded": isExpanded,
	tabIndex: 0,
	onClick,
	onKeyDown: createKeyboardActivationHandler(onClick),
})

// ============================================================================
// FOCUS TRAP UTILITIES
// ============================================================================

/** Selector for all focusable elements */
const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Gets all focusable elements within a container.
 * Filters disabled and aria-hidden elements, with optional input prioritization.
 *
 * @param container - Container element to search within
 * @param prioritizeInputs - Whether to sort inputs before buttons (default: true for search modals)
 * @returns Array of focusable HTMLElements
 */
export const getFocusableElements = (container: HTMLElement, prioritizeInputs = true): HTMLElement[] => {
	const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		(el) => !el.hasAttribute("disabled") && !el.hasAttribute("aria-hidden"),
	)

	if (!prioritizeInputs) {
		return elements
	}

	// Sort to prioritize inputs (for search fields, etc.)
	return elements.sort((a, b) => {
		const aIsInput = a.tagName === "INPUT" || a.tagName === "TEXTAREA"
		const bIsInput = b.tagName === "INPUT" || b.tagName === "TEXTAREA"
		if (aIsInput && !bIsInput) {
			return -1
		}
		if (!aIsInput && bIsInput) {
			return 1
		}
		return 0
	})
}

/**
 * Creates a keyboard handler for focus trapping within a container.
 *
 * Traps Tab and Shift+Tab navigation within the container,
 * wrapping from last to first element and vice versa.
 *
 * @param containerRef - Ref to the container element
 * @param options - Focus trap configuration
 * @returns Keyboard event handler for the container
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null)
 * const handleKeyDown = createFocusTrapHandler(containerRef, {
 *   onEscape: () => setIsOpen(false)
 * })
 * <div ref={containerRef} onKeyDown={handleKeyDown}>...</div>
 * ```
 */
export const createFocusTrapHandler =
	(
		containerRef: React.RefObject<HTMLElement>,
		options?: Pick<FocusTrapOptions, "onEscape">,
	): React.KeyboardEventHandler<HTMLElement> =>
	(e) => {
		const container = containerRef.current
		if (!container) {
			return
		}

		// Handle Escape key
		if (e.key === "Escape" && options?.onEscape) {
			e.preventDefault()
			options.onEscape()
			return
		}

		// Handle Tab key for focus trapping
		if (e.key !== "Tab") {
			return
		}

		const focusableElements = getFocusableElements(container)
		if (focusableElements.length === 0) {
			return
		}

		const firstElement = focusableElements[0]
		const lastElement = focusableElements[focusableElements.length - 1]

		// Shift+Tab on first element -> go to last
		if (e.shiftKey && document.activeElement === firstElement) {
			e.preventDefault()
			lastElement.focus()
		}
		// Tab on last element -> go to first
		else if (!e.shiftKey && document.activeElement === lastElement) {
			e.preventDefault()
			firstElement.focus()
		}
	}

/**
 * Focuses the first focusable element within a container.
 *
 * @param container - Container element to search within
 * @param initialFocusRef - Optional specific element to focus instead
 */
export const focusFirstElement = (container: HTMLElement, initialFocusRef?: React.RefObject<HTMLElement>): void => {
	if (initialFocusRef?.current) {
		initialFocusRef.current.focus()
		return
	}
	const focusableElements = getFocusableElements(container)
	if (focusableElements.length > 0) {
		focusableElements[0].focus()
	}
}

// ============================================================================
// FORM INPUT UTILITIES
// ============================================================================

/** Shared validation props applied to form inputs/selects */
type ValidationAriaProps = {
	"aria-invalid"?: boolean
	"aria-describedby"?: string
	"aria-errormessage"?: string
}

/** Applies validation state ARIA attributes to form field props (DRY helper) */
const applyValidationProps = (validation?: InputValidationState): ValidationAriaProps => {
	if (!validation) {
		return {}
	}

	const { hasError, errorId, descriptionId } = validation
	const props: ValidationAriaProps = {}

	if (hasError) {
		props["aria-invalid"] = true
	}

	const describedByIds: string[] = []
	if (descriptionId) {
		describedByIds.push(descriptionId)
	}
	if (hasError && errorId) {
		describedByIds.push(errorId)
		props["aria-errormessage"] = errorId
	}
	if (describedByIds.length > 0) {
		props["aria-describedby"] = describedByIds.join(" ")
	}

	return props
}

/**
 * Creates accessible input props with validation state support.
 *
 * Automatically manages aria-invalid, aria-describedby, and aria-errormessage
 * based on validation state.
 *
 * @param ariaLabel - Accessible label for the input
 * @param validation - Optional validation state
 * @param inputId - Optional ID for the input (used to generate related IDs)
 * @returns Typed input props with accessibility attributes
 *
 * @example
 * ```tsx
 * const [error, setError] = useState("")
 * const inputProps = createInputProps("Email address", {
 *   hasError: !!error,
 *   errorMessage: error,
 *   errorId: "email-error"
 * })
 *
 * return (
 *   <>
 *     <input {...inputProps} type="email" />
 *     {error && <span id="email-error">{error}</span>}
 *   </>
 * )
 * ```
 */
export const createInputProps = (ariaLabel: string, validation?: InputValidationState, inputId?: string): InputProps => ({
	"aria-label": ariaLabel,
	...(inputId && { id: inputId }),
	...applyValidationProps(validation),
})

/**
 * Creates accessible select props with validation state support.
 *
 * @param ariaLabel - Accessible label for the select
 * @param validation - Optional validation state
 * @param selectId - Optional ID for the select
 * @returns Typed select props with accessibility attributes
 */
export const createSelectProps = (ariaLabel: string, validation?: InputValidationState, selectId?: string): SelectProps => ({
	"aria-label": ariaLabel,
	...(selectId && { id: selectId }),
	...applyValidationProps(validation),
})

/**
 * Generates consistent IDs for form field accessibility relationships.
 *
 * @param baseId - Base ID for the form field
 * @returns Object with IDs for input, label, description, and error elements
 *
 * @example
 * ```tsx
 * const ids = generateFieldIds("email")
 * // Returns: { inputId: "email", labelId: "email-label", descriptionId: "email-description", errorId: "email-error" }
 *
 * return (
 *   <>
 *     <label id={ids.labelId} htmlFor={ids.inputId}>Email</label>
 *     <input id={ids.inputId} aria-labelledby={ids.labelId} />
 *     <span id={ids.descriptionId}>We'll never share your email</span>
 *     {error && <span id={ids.errorId}>{error}</span>}
 *   </>
 * )
 * ```
 */
export const generateFieldIds = (
	baseId: string,
): {
	inputId: string
	labelId: string
	descriptionId: string
	errorId: string
} => ({
	inputId: baseId,
	labelId: `${baseId}-label`,
	descriptionId: `${baseId}-description`,
	errorId: `${baseId}-error`,
})

// ============================================================================
// LINK UTILITIES
// ============================================================================

/**
 * Creates accessible link props.
 *
 * Use for internal navigation links. Ensures href is provided
 * and allows optional aria-label for non-descriptive link text.
 *
 * @param href - Link destination URL
 * @param ariaLabel - Optional accessible label if link text is not descriptive
 * @returns Typed link props
 *
 * @example
 * ```tsx
 * // Descriptive link text - no aria-label needed
 * <a {...createLinkProps("/settings")}>Open Settings</a>
 *
 * // Non-descriptive link text - aria-label required
 * <a {...createLinkProps("/settings", "Open application settings")}>Click here</a>
 * ```
 */
export const createLinkProps = (href: string, ariaLabel?: string): LinkProps => {
	const props: LinkProps = { href }
	if (ariaLabel) {
		props["aria-label"] = ariaLabel
	}
	return props
}

/**
 * Creates accessible external link props.
 *
 * Use for links that open in a new tab. Automatically adds:
 * - target="_blank" to open in new tab
 * - rel="noopener noreferrer" for security
 * - Screen reader warning about new tab (via aria-label suffix)
 *
 * @param href - External URL
 * @param ariaLabel - Accessible label (will append "opens in new tab" warning)
 * @returns Typed external link props with security attributes
 *
 * @example
 * ```tsx
 * <a {...createExternalLinkProps("https://example.com", "Visit Example Site")}>
 *   Example Site
 * </a>
 * // Renders with aria-label="Visit Example Site (opens in new tab)"
 * ```
 */
export const createExternalLinkProps = (href: string, ariaLabel: string): ExternalLinkProps => ({
	href,
	target: "_blank",
	rel: "noopener noreferrer",
	"aria-label": `${ariaLabel} (opens in new tab)`,
})

// ============================================================================
// FOCUS VISIBILITY UTILITIES (WCAG 2.2 - 2.4.11)
// ============================================================================

/**
 * Ensures an element is visible when it receives focus.
 *
 * WCAG 2.4.11 (Focus Not Obscured) requires that focused elements
 * are at least partially visible. This utility scrolls the element
 * into view with appropriate margins.
 *
 * @param element - The element to ensure visibility for
 * @param options - Scroll behavior options
 *
 * @example
 * ```tsx
 * const buttonRef = useRef<HTMLButtonElement>(null)
 *
 * const handleFocus = () => {
 *   if (buttonRef.current) {
 *     ensureFocusVisible(buttonRef.current)
 *   }
 * }
 *
 * <button ref={buttonRef} onFocus={handleFocus}>Click me</button>
 * ```
 */
export const ensureFocusVisible = (element: HTMLElement, options?: ScrollIntoViewOptions): void => {
	element.scrollIntoView({
		behavior: "smooth",
		block: "nearest",
		inline: "nearest",
		...options,
	})
}

/**
 * Creates a focus handler that ensures the element is not obscured.
 *
 * Use this to automatically scroll focused elements into view,
 * especially useful for elements that might be hidden by sticky
 * headers, modals, or other overlays.
 *
 * @param scrollOptions - Optional scroll behavior configuration
 * @returns Focus event handler
 *
 * @example
 * ```tsx
 * <button onFocus={createFocusVisibleHandler()}>
 *   This button will scroll into view when focused
 * </button>
 * ```
 */
export const createFocusVisibleHandler =
	(scrollOptions?: ScrollIntoViewOptions): React.FocusEventHandler<HTMLElement> =>
	(e) => {
		ensureFocusVisible(e.currentTarget, scrollOptions)
	}

/**
 * Checks if an element is at least partially visible in the viewport.
 *
 * WCAG 2.4.11 requires that focused elements are at least partially
 * visible. Use this to verify visibility after focus changes.
 *
 * @param element - The element to check
 * @returns True if at least part of the element is visible
 *
 * @example
 * ```tsx
 * const handleFocus = (e: React.FocusEvent) => {
 *   if (!isElementPartiallyVisible(e.currentTarget)) {
 *     ensureFocusVisible(e.currentTarget)
 *   }
 * }
 * ```
 */
export const isElementPartiallyVisible = (element: HTMLElement): boolean => {
	const rect = element.getBoundingClientRect()
	const windowHeight = window.innerHeight || document.documentElement.clientHeight
	const windowWidth = window.innerWidth || document.documentElement.clientWidth

	// Check if any part of the element is within the viewport
	const verticallyVisible = rect.top < windowHeight && rect.bottom > 0
	const horizontallyVisible = rect.left < windowWidth && rect.right > 0

	return verticallyVisible && horizontallyVisible
}

// ============================================================================
// STYLE UTILITIES
// ============================================================================

/**
 * Merges custom styles with interactive base styles.
 *
 * Combines one or more base style presets from InteractiveStyles with custom
 * style overrides. Base styles are applied first, then custom styles override.
 *
 * @param baseStyle - Single style key or array of style keys from InteractiveStyles
 * @param customStyle - Custom CSS properties to override base styles (optional)
 * @returns Merged React.CSSProperties object
 *
 * @example
 * ```tsx
 * // Single base style
 * const style1 = mergeInteractiveStyles("buttonReset", { padding: "10px" })
 *
 * // Multiple base styles
 * const style2 = mergeInteractiveStyles(
 *   ["buttonReset", "flexButton", "noSelect"],
 *   { padding: "10px", color: "red" }
 * )
 * ```
 */
export const mergeInteractiveStyles = <T extends React.CSSProperties>(
	baseStyle: keyof typeof InteractiveStyles | (keyof typeof InteractiveStyles)[],
	customStyle?: T,
): React.CSSProperties => {
	let baseStyles: React.CSSProperties

	if (Array.isArray(baseStyle)) {
		const merged: React.CSSProperties = {}
		for (const key of baseStyle) {
			const styleObj = InteractiveStyles[key]
			const entries = Object.entries(styleObj)
			for (const [prop, value] of entries) {
				merged[prop as keyof React.CSSProperties] = value
			}
		}
		baseStyles = merged
	} else {
		baseStyles = InteractiveStyles[baseStyle]
	}

	return { ...baseStyles, ...customStyle }
}

/**
 * Pre-configured button style builders for common patterns.
 *
 * These utilities combine multiple base styles into commonly-used configurations,
 * reducing boilerplate and ensuring consistency across the application.
 */
export const createButtonStyle = {
	/**
	 * Basic button reset - removes default browser styling.
	 *
	 * Use for minimal reset when you need full control over styling.
	 *
	 * @param customStyle - Additional custom styles (optional)
	 * @returns Merged style object
	 *
	 * @example
	 * ```tsx
	 * <button style={createButtonStyle.reset({ textAlign: "left" })}>Content</button>
	 * ```
	 */
	reset: (customStyle?: React.CSSProperties): React.CSSProperties => mergeInteractiveStyles(["buttonReset"], customStyle),

	/**
	 * Reset button with flex layout and no text selection.
	 *
	 * Removes default browser button styling and adds flex layout.
	 * Use for custom-styled buttons that need flex container behavior.
	 *
	 * @param customStyle - Additional custom styles (optional)
	 * @returns Merged style object
	 *
	 * @example
	 * ```tsx
	 * const buttonProps = {
	 *   ...createToggleButtonProps(isExpanded, onToggle, "Toggle"),
	 *   style: createButtonStyle.flexReset({ padding: "8px" })
	 * }
	 * ```
	 */
	flexReset: (customStyle?: React.CSSProperties): React.CSSProperties =>
		mergeInteractiveStyles(["buttonReset", "flexButton", "noSelect"], customStyle),

	/**
	 * Full-width button with flex layout and no text selection.
	 *
	 * Combines button reset, flex layout, full width, and no text selection.
	 * Use for buttons that should span the full width of their container.
	 *
	 * @param customStyle - Additional custom styles (optional)
	 * @returns Merged style object
	 *
	 * @example
	 * ```tsx
	 * const buttonProps = {
	 *   ...createToggleButtonProps(isExpanded, onToggle, "Toggle"),
	 *   style: createButtonStyle.fullWidthFlex({
	 *     padding: "9px 10px",
	 *     textAlign: "left"
	 *   })
	 * }
	 * ```
	 */
	fullWidthFlex: (customStyle?: React.CSSProperties): React.CSSProperties =>
		mergeInteractiveStyles(["buttonReset", "flexButton", "fullWidth", "noSelect"], customStyle),

	/**
	 * Icon button with reset styles and flex layout.
	 *
	 * Optimized for icon-only buttons with minimal styling.
	 * Use for toolbar icons, close buttons, and other icon-based actions.
	 * Note: Functionally identical to flexReset - use whichever name is more semantic.
	 *
	 * @param customStyle - Additional custom styles (optional)
	 * @returns Merged style object
	 *
	 * @example
	 * ```tsx
	 * const closeButtonProps = {
	 *   ...createIconButtonProps("Close", handleClose),
	 *   style: createButtonStyle.icon({ padding: "4px" })
	 * }
	 * ```
	 */
	icon: (customStyle?: React.CSSProperties): React.CSSProperties => createButtonStyle.flexReset(customStyle),
}
