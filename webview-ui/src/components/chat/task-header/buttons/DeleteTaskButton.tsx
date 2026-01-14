import { StringArrayRequest } from "@shared/proto/cline/common"
import { TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { TaskServiceClient } from "@/services/grpc-client"
import { formatSize } from "@/utils/format"
import { createIconButtonProps } from "@/utils/interactiveProps"

const DeleteTaskButton: React.FC<{
	taskId?: string
	taskSize?: number
	className?: string
}> = ({ taskId, className, taskSize }) => (
	<Tooltip>
		<TooltipContent>{`Delete Task (size: ${taskSize ? formatSize(taskSize) : "--"})`}</TooltipContent>
		<TooltipTrigger className={cn("flex items-center", className)}>
			<Button
				{...createIconButtonProps("Delete Task", (e) => {
					e.preventDefault()
					e.stopPropagation()
					taskId && TaskServiceClient.deleteTasksWithIds(StringArrayRequest.create({ value: [taskId] }))
				})}
				disabled={!taskId}
				size="xs"
				variant="icon">
				<TrashIcon />
			</Button>
		</TooltipTrigger>
	</Tooltip>
)
DeleteTaskButton.displayName = "DeleteTaskButton"

export default DeleteTaskButton
