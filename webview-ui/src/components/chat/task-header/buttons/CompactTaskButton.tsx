import { FoldVerticalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { createIconButtonProps } from "@/utils/interactiveProps"

const CompactTaskButton: React.FC<{
	className?: string
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}> = ({ onClick, className }) => {
	return (
		<Tooltip>
			<TooltipContent side="left">Compact Task</TooltipContent>
			<TooltipTrigger className={cn("flex items-center", className)}>
				<Button
					{...createIconButtonProps("Compact Task", (e) => {
						e.preventDefault()
						e.stopPropagation()
						onClick(e)
					})}
					className="[&_svg]:size-3"
					size="icon"
					variant="icon">
					<FoldVerticalIcon />
				</Button>
			</TooltipTrigger>
		</Tooltip>
	)
}

export default CompactTaskButton
