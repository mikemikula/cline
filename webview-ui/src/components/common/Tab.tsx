import React, { forwardRef, HTMLAttributes, useCallback, useMemo, useRef } from "react"

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

	// Arrow key navigation handler
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key !== "ArrowUp" && e.key !== "ArrowDown") {
				return
			}

			e.preventDefault()

			// Find current tab index
			const currentIndex = tabValues.indexOf(value)
			if (currentIndex === -1) return

			// Calculate next index with wraparound
			let nextIndex: number
			if (e.key === "ArrowDown") {
				nextIndex = (currentIndex + 1) % tabValues.length
			} else {
				nextIndex = (currentIndex - 1 + tabValues.length) % tabValues.length
			}

			// Change to next tab and focus it
			const nextValue = tabValues[nextIndex]
			onValueChange(nextValue)

			// Focus the next tab button
			requestAnimationFrame(() => {
				const nextButton = tabRefs.current.get(nextValue)
				nextButton?.focus()
			})
		},
		[tabValues, value, onValueChange],
	)

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
	// Ensure we're using the value prop correctly
	return (
		<button
			aria-selected={isSelected}
			className={`focus:outline-none ${className}`}
			data-value={value}
			onClick={onSelect}
			ref={ref}
			role="tab"
			tabIndex={isSelected ? 0 : -1} // Add data-value attribute for debugging
			type="button"
			{...props}>
			{children}
		</button>
	)
})

TabList.displayName = "TabList"
TabTrigger.displayName = "TabTrigger"
