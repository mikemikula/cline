import type React from "react"

/**
 * Base props for all button elements.
 *
 * Foundation interface that all button types extend. Enforces required
 * accessibility attributes (aria-label) at the type level to prevent
 * creating inaccessible buttons.
 *
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement>
 */
export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Accessible label for screen readers (required for accessibility compliance) */
	"aria-label": string
	/** HTML button type attribute */
	type?: "button" | "submit" | "reset"
}

/**
 * Props for toggle/expandable button elements.
 *
 * Use for accordions, dropdowns, collapsible sections, and any element
 * that can be expanded or collapsed. Includes aria-expanded for proper
 * screen reader announcements.
 *
 * @extends BaseButtonProps
 */
export interface ToggleButtonProps extends BaseButtonProps {
	/** ARIA attribute indicating current expanded state */
	"aria-expanded": boolean
}

/**
 * Props for icon-only button elements.
 *
 * Use for buttons with only an icon and no visible text label.
 * The aria-label is required to ensure screen reader users understand
 * the button's purpose.
 *
 * @extends BaseButtonProps
 */
export interface IconButtonProps extends BaseButtonProps {
	// No additional props - all icon buttons use standard HTML button attributes
}

/**
 * Props for link-styled button elements.
 *
 * Use for buttons that should look like links but maintain proper button
 * semantics. Explicitly prevents href attribute to enforce button behavior.
 *
 * @extends BaseButtonProps
 */
export interface LinkButtonProps extends BaseButtonProps {
	/** Explicitly prevented to enforce button semantics over anchor tags */
	href?: never
}

/**
 * Props for modal/dialog trigger buttons.
 *
 * Use for buttons that open modals, dialogs, menus, or other popup elements.
 * Includes proper ARIA attributes for popup relationships.
 *
 * @extends BaseButtonProps
 */
export interface ModalTriggerButtonProps extends BaseButtonProps {
	/** ARIA attribute indicating the type of popup this button controls */
	"aria-haspopup": "dialog" | "menu" | "listbox" | "tree" | "grid" | true
	/** Optional ID of the element this button controls */
	"aria-controls"?: string
}

/**
 * Props for tab button elements.
 *
 * Use in tab navigation patterns. Includes proper ARIA tab attributes
 * and tabIndex management for keyboard navigation.
 *
 * @extends BaseButtonProps
 */
export interface TabButtonProps extends BaseButtonProps {
	/** ARIA role for tab navigation */
	role: "tab"
	/** ARIA attribute indicating if this tab is currently selected */
	"aria-selected": boolean
	/** ID of the tab panel this tab controls */
	"aria-controls": string
	/** Tab index for keyboard navigation (0 if selected, -1 if not) */
	tabIndex: 0 | -1
}

/**
 * Props for switch/checkbox button elements.
 *
 * Use for toggle switches that maintain button semantics rather than
 * using checkbox inputs. Includes proper ARIA switch attributes.
 *
 * @extends BaseButtonProps
 */
export interface SwitchButtonProps extends BaseButtonProps {
	/** ARIA role for switch/toggle behavior */
	role: "switch"
	/** ARIA attribute indicating current checked/on state */
	"aria-checked": boolean
}

/**
 * Options for tab keyboard navigation.
 *
 * Use with createTabButtonProps to enable arrow key navigation
 * in tab lists per WCAG guidelines.
 */
export interface TabNavigationOptions {
	/** Called when navigating to next tab (Right/Down arrow) */
	onNext?: () => void
	/** Called when navigating to previous tab (Left/Up arrow) */
	onPrev?: () => void
	/** Called when Home key is pressed */
	onFirst?: () => void
	/** Called when End key is pressed */
	onLast?: () => void
	/** Navigation direction (default: "horizontal") */
	orientation?: "horizontal" | "vertical"
}

/**
 * Props for tablist container element.
 *
 * Use for the container that holds tab buttons. Required for proper
 * screen reader announcement of tab navigation context.
 */
export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
	/** ARIA role for tab list container */
	role: "tablist"
	/** Accessible label for the tab group */
	"aria-label": string
	/** Orientation of tabs (default: "horizontal") */
	"aria-orientation"?: "horizontal" | "vertical"
}

/**
 * Props for tab panel elements.
 *
 * Use for content panels controlled by tabs. Links panel to its
 * controlling tab via aria-labelledby.
 */
export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
	/** ARIA role for tab panel */
	role: "tabpanel"
	/** Unique ID for this panel (referenced by tab's aria-controls) */
	id: string
	/** ID of the tab that controls this panel */
	"aria-labelledby": string
	/** Tab index for panel focus (0 when visible, -1 when hidden) */
	tabIndex: 0 | -1
	/** Whether this panel is hidden */
	hidden?: boolean
}

/**
 * Props for listbox container element.
 *
 * Use for dropdown menus, combobox popups, and selection lists.
 * Manages aria-activedescendant for virtual focus.
 */
export interface ListboxProps extends React.HTMLAttributes<HTMLDivElement> {
	/** ARIA role for listbox container */
	role: "listbox"
	/** Accessible label for the listbox */
	"aria-label": string
	/** ID of the currently active/focused option */
	"aria-activedescendant"?: string
	/** Tab index for keyboard focus */
	tabIndex: number
}

/**
 * Props for listbox option elements.
 *
 * Use for individual options within a listbox. Supports
 * both interactive (selectable) and non-interactive options.
 */
export interface ListboxOptionProps extends React.HTMLAttributes<HTMLDivElement> {
	/** ARIA role for option */
	role: "option"
	/** Accessible label for the option */
	"aria-label": string
	/** Whether this option is selected */
	"aria-selected": boolean
	/** Unique ID for aria-activedescendant reference */
	id: string
	/** Tab index (-1 for roving tabindex pattern) */
	tabIndex: number
}

/**
 * Props for div elements used as interactive buttons.
 *
 * Use when a native button element isn't suitable (e.g., wrapping
 * complex children that shouldn't be in a button). Includes all
 * required accessibility attributes for button-like behavior.
 */
export interface InteractiveDivProps extends React.HTMLAttributes<HTMLDivElement> {
	/** ARIA role for button behavior */
	role: "button"
	/** Accessible label for screen readers */
	"aria-label": string
	/** Tab index for keyboard focus */
	tabIndex: number
	/** Click handler */
	onClick: React.MouseEventHandler<HTMLDivElement>
	/** Keyboard handler for Enter/Space activation */
	onKeyDown: React.KeyboardEventHandler<HTMLDivElement>
}

/**
 * Props for div elements used as modal/popup triggers.
 *
 * Extends InteractiveDivProps with ARIA attributes for modal triggers.
 */
export interface InteractiveDivModalTriggerProps extends InteractiveDivProps {
	/** Indicates element opens a popup */
	"aria-haspopup": "dialog" | "menu" | "listbox" | "tree" | "grid" | true
	/** Current expanded state */
	"aria-expanded"?: boolean
}

/**
 * Options for focus trap behavior.
 *
 * Use with useFocusTrap hook to trap keyboard focus within
 * modals, dialogs, and other overlay elements.
 */
export interface FocusTrapOptions {
	/** Whether focus trap is active */
	enabled?: boolean
	/** Element to focus on activation (default: first focusable) */
	initialFocusRef?: React.RefObject<HTMLElement>
	/** Element to return focus to on deactivation (default: trigger) */
	returnFocusRef?: React.RefObject<HTMLElement>
	/** Called when Escape key is pressed */
	onEscape?: () => void
	/** Whether to close on outside click */
	closeOnOutsideClick?: boolean
}

/**
 * Props for accessible text input elements.
 *
 * Use for text inputs, textareas, and other form fields.
 * Includes required accessibility attributes and validation states.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	/** Accessible label for the input (required) */
	"aria-label"?: string
	/** ID of element that labels this input */
	"aria-labelledby"?: string
	/** ID of element that describes this input */
	"aria-describedby"?: string
	/** Whether the input value is invalid */
	"aria-invalid"?: boolean
	/** ID of element containing error message */
	"aria-errormessage"?: string
	/** Whether the input is required */
	"aria-required"?: boolean
}

/**
 * Props for accessible select elements.
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	/** Accessible label for the select */
	"aria-label"?: string
	/** ID of element that labels this select */
	"aria-labelledby"?: string
	/** ID of element that describes this select */
	"aria-describedby"?: string
	/** Whether the select value is invalid */
	"aria-invalid"?: boolean
	/** Whether the select is required */
	"aria-required"?: boolean
}

/**
 * Validation state for form inputs.
 */
export interface InputValidationState {
	/** Whether the input has an error */
	hasError: boolean
	/** Error message to display */
	errorMessage?: string
	/** ID for the error message element */
	errorId?: string
	/** Additional description/hint text */
	description?: string
	/** ID for the description element */
	descriptionId?: string
}

/**
 * Props for accessible anchor/link elements.
 *
 * Use for links that navigate to other pages or external resources.
 * Enforces descriptive content and proper security attributes.
 */
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	/** Accessible label if link text is not descriptive enough */
	"aria-label"?: string
	/** ID of element that describes the link destination */
	"aria-describedby"?: string
	/** Required href for valid links */
	href: string
}

/**
 * Props for external links (opens in new tab).
 *
 * Automatically adds security attributes and screen reader warning.
 */
export interface ExternalLinkProps extends LinkProps {
	/** Opens in new tab */
	target: "_blank"
	/** Security: prevents opener access */
	rel: "noopener noreferrer"
}

/**
 * Common style configurations for interactive elements.
 *
 * Provides reusable CSS property objects for consistent styling patterns
 * across the application. All styles use const assertions for type safety.
 *
 * These styles can be combined using mergeInteractiveStyles() or used
 * individually in component styling.
 */
export const InteractiveStyles = {
	/**
	 * Base button reset styles.
	 *
	 * Removes all default browser button styling to provide a clean slate
	 * for custom button designs. Resets border, background, padding, margin,
	 * and inherits font from parent.
	 */
	buttonReset: {
		border: "none",
		background: "transparent",
		padding: 0,
		margin: 0,
		font: "inherit",
		cursor: "pointer",
	} as const,

	/**
	 * Focus-visible styles for keyboard navigation.
	 *
	 * Provides accessible focus indicators for keyboard users while avoiding
	 * focus rings on mouse clicks. Uses VSCode theme variables for consistency.
	 */
	focusVisible: {
		outline: "2px solid var(--vscode-focusBorder)",
		outlineOffset: "2px",
	} as const,

	/**
	 * Disabled state styles.
	 *
	 * Visual and interaction styling for disabled buttons. Reduces opacity,
	 * changes cursor, and prevents pointer events.
	 */
	disabled: {
		opacity: 0.5,
		cursor: "not-allowed",
		pointerEvents: "none" as const,
	} as const,

	/**
	 * User select prevention for button-like elements.
	 *
	 * Prevents text selection on button elements across all browsers.
	 * Includes vendor prefixes for maximum compatibility.
	 */
	noSelect: {
		userSelect: "none" as const,
		WebkitUserSelect: "none" as const,
		MozUserSelect: "none" as const,
		msUserSelect: "none" as const,
	} as const,

	/**
	 * Flex container for button content.
	 *
	 * Sets up flexbox layout with centered content alignment.
	 * Use for buttons that need to center icons, text, or mixed content.
	 */
	flexButton: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	} as const,

	/**
	 * Full width button.
	 *
	 * Makes button span the full width of its container.
	 * Commonly used for primary actions in modals or forms.
	 */
	fullWidth: {
		width: "100%",
	} as const,
} as const

/**
 * Type guard to check if props represent a toggle button.
 *
 * Runtime validation that checks for the presence of toggle-specific
 * properties. Useful for conditional rendering or prop validation.
 *
 * @param props - Props object to check
 * @returns True if props match ToggleButtonProps interface
 *
 * @example
 * ```tsx
 * if (isToggleButton(buttonProps)) {
 *   console.log("Expanded:", buttonProps["aria-expanded"])
 * }
 * ```
 */
export const isToggleButton = (props: any): props is ToggleButtonProps => {
	return "aria-expanded" in props
}

/**
 * Type guard to check if props represent a tab button.
 *
 * Runtime validation that checks for tab-specific ARIA attributes.
 * Useful for validating tab navigation implementations.
 *
 * @param props - Props object to check
 * @returns True if props match TabButtonProps interface
 *
 * @example
 * ```tsx
 * if (isTabButton(buttonProps)) {
 *   console.log("Selected:", buttonProps["aria-selected"])
 * }
 * ```
 */
export const isTabButton = (props: any): props is TabButtonProps => {
	return props.role === "tab" && "aria-selected" in props && "aria-controls" in props
}

/**
 * Type guard to check if props represent a switch button.
 *
 * Runtime validation that checks for switch-specific ARIA attributes.
 * Useful for validating toggle switch implementations.
 *
 * @param props - Props object to check
 * @returns True if props match SwitchButtonProps interface
 *
 * @example
 * ```tsx
 * if (isSwitchButton(buttonProps)) {
 *   console.log("Checked:", buttonProps["aria-checked"])
 * }
 * ```
 */
export const isSwitchButton = (props: any): props is SwitchButtonProps => {
	return props.role === "switch" && "aria-checked" in props
}
