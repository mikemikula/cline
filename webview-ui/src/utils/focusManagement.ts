import { RefObject, useEffect, useRef } from "react"
import { getFocusableElements } from "./interactiveProps"

export { getFocusableElements } from "./interactiveProps"

/**
 * Hook to trap focus within a container (typically a modal)
 * Prevents focus from escaping to background elements
 */
export function useFocusTrap(isActive: boolean, containerRef: RefObject<HTMLElement>): void {
	useEffect(() => {
		if (!isActive || !containerRef.current) {
			return
		}

		const container = containerRef.current

		const handleTabKey = (e: KeyboardEvent): void => {
			if (e.key !== "Tab") {
				return
			}

			const focusableElements = getFocusableElements(container)
			if (focusableElements.length === 0) {
				e.preventDefault()
				return
			}

			const firstElement = focusableElements[0]
			const lastElement = focusableElements[focusableElements.length - 1]

			if (e.shiftKey) {
				// Shift + Tab: moving backwards
				if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
					e.preventDefault()
					lastElement.focus()
				}
			} else {
				// Tab: moving forwards
				if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
					e.preventDefault()
					firstElement.focus()
				}
			}
		}

		// Focus first element when trap activates
		const focusableElements = getFocusableElements(container)
		if (focusableElements.length > 0 && !container.contains(document.activeElement)) {
			focusableElements[0].focus()
		}

		document.addEventListener("keydown", handleTabKey)
		return () => document.removeEventListener("keydown", handleTabKey)
	}, [isActive, containerRef])
}

/**
 * Hook to restore focus to a target element when a component unmounts or closes
 * Useful for modals that should return focus to their trigger button
 */
export function useFocusRestoration(restoreTargetRef: RefObject<HTMLElement>): void {
	const previousActiveElementRef = useRef<HTMLElement | null>(null)

	useEffect(() => {
		// Store the currently focused element when component mounts
		previousActiveElementRef.current = document.activeElement as HTMLElement

		return () => {
			// Restore focus when component unmounts
			if (restoreTargetRef.current) {
				restoreTargetRef.current.focus()
			} else if (previousActiveElementRef.current && document.contains(previousActiveElementRef.current)) {
				previousActiveElementRef.current.focus()
			}
		}
	}, [restoreTargetRef])
}

/**
 * Composite hook for modal focus management
 * Combines focus trap, focus restoration, and Escape key handling
 *
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback to close the modal
 * @param externalTriggerRef - Optional external ref for the trigger element (for cases where parent owns the ref)
 * @returns Refs for the trigger element (e.g., button) and modal container
 *
 * @example
 * // Simple usage - hook creates and manages refs
 * const { triggerRef, containerRef } = useModal(isVisible, () => setIsVisible(false))
 * return (
 *   <>
 *     <button ref={triggerRef}>Open Modal</button>
 *     {isVisible && <div ref={containerRef}>Modal content</div>}
 *   </>
 * )
 *
 * @example
 * // Advanced usage - parent owns trigger ref
 * const myButtonRef = useRef<HTMLButtonElement>(null)
 * const { containerRef } = useModal(isVisible, () => setIsVisible(false), myButtonRef)
 * return (
 *   <>
 *     <button ref={myButtonRef}>Open Modal</button>
 *     {isVisible && <div ref={containerRef}>Modal content</div>}
 *   </>
 * )
 */
export function useModal<TriggerElement extends HTMLElement = HTMLElement, ContainerElement extends HTMLElement = HTMLElement>(
	isOpen: boolean,
	onClose: () => void,
	externalTriggerRef?: RefObject<TriggerElement>,
) {
	const internalTriggerRef = useRef<TriggerElement>(null)
	const containerRef = useRef<ContainerElement>(null)

	// Use external ref if provided, otherwise use internal
	const triggerRef = externalTriggerRef || internalTriggerRef

	useFocusTrap(isOpen, containerRef)
	useFocusRestoration(triggerRef)

	useEffect(() => {
		if (!isOpen) {
			return
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault()
				onClose()
			}
		}

		window.addEventListener("keydown", handleEscape)
		return () => window.removeEventListener("keydown", handleEscape)
	}, [isOpen, onClose])

	return { triggerRef, containerRef }
}
