import React, { forwardRef, HTMLAttributes, useCallback, useMemo, useRef } from "react"
import { createArrowKeyNavigationHandler, createTabButtonProps } from "@/utils/interactiveProps"

type TabProps = HTMLAttributes<HTMLDivElement>

export const Tab = ({ className, children, ...props }: TabProps) => (
	<div className={`fixed inset-0 flex flex-col ${className}`} {...props}>
		{children}
	</div>
)

export const TabHeader = ({ className, children, ...props }: TabProps) => (
	<div className={`px-5 py-2.5 border-b border-(--vscode-panel-border) ${className}`} {...props}>
		{children}
	</div>
)

export const TabContent = ({ className, children, ...props }: TabProps) => {
	const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement

		// Prevent scrolling if the target is a listbox or option
		// (e.g. selects, dropdowns, etc).
		if (target.role === "listbox" || target.role === "option") {
			return
		}

		e.currentTarget.scrollTop += e.deltaY
	}, [])

	return (
		<div className={`flex-1 overflow-auto ${className}`} onWheel={onWheel} {...props}>
			{children}
		</div>
	)
}

export const TabList = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement> & {
		value: string
		onValueChange: (value: string) => void
	}
>(({ children, className, value, onValueChange, ...props }, ref) => {
	const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

	// Build array of tab values from children
	const tabValues = useMemo(() => {
		const values: string[] = []
		React.Children.forEach(children, (child) => {
			if (React.isValidElement(child) && child.props.value) {
				values.push(child.props.value)
			}
		})
		return values
	}, [children])

	const handleTabSelect = useCallback(
		(tabValue: string) => {
			console.log("Tab selected:", tabValue)
			onValueChange(tabValue)
		},
		[onValueChange],
	)

	// Navigate to tab at index and focus it
	const navigateToTab = useCallback(
		(index: number) => {
			const nextValue = tabValues[index]
			if (nextValue) {
				onValueChange(nextValue)
				requestAnimationFrame(() => {
					tabRefs.current.get(nextValue)?.focus()
				})
			}
		},
		[tabValues, onValueChange],
	)

	const handleKeyDown = useMemo(() => {
		const currentIndex = tabValues.indexOf(value)
		if (currentIndex === -1) {
			return undefined
		}

		return createArrowKeyNavigationHandler({
			onNext: () => navigateToTab((currentIndex + 1) % tabValues.length),
			onPrev: () => navigateToTab((currentIndex - 1 + tabValues.length) % tabValues.length),
			onFirst: () => navigateToTab(0),
			onLast: () => navigateToTab(tabValues.length - 1),
			orientation: "both", // Support both horizontal and vertical arrows
		})
	}, [tabValues, value, navigateToTab])

	return (
		<div className={`flex ${className}`} onKeyDown={handleKeyDown} ref={ref} role="tablist" {...props}>
			{React.Children.map(children, (child) => {
				if (React.isValidElement(child)) {
					// Make sure we're passing the correct props to the TabTrigger
					return React.cloneElement(child as React.ReactElement<any>, {
						isSelected: child.props.value === value,
						onSelect: () => handleTabSelect(child.props.value),
						ref: (el: HTMLButtonElement) => {
							if (el) {
								tabRefs.current.set(child.props.value, el)
							}
						},
					})
				}
				return child
			})}
		</div>
	)
})

export const TabTrigger = forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		value: string
		isSelected?: boolean
		onSelect?: () => void
	}
>(({ children, className, value, isSelected, onSelect, ...props }, ref) => {
	const tabButtonProps = createTabButtonProps(value, isSelected ?? false, `panel-${value}`, onSelect ?? (() => {}))

	return (
		<button {...tabButtonProps} className={`focus:outline-none ${className}`} data-value={value} ref={ref} {...props}>
			{children}
		</button>
	)
})

TabList.displayName = "TabList"
TabTrigger.displayName = "TabTrigger"
