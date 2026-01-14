import { StringRequest } from "@shared/proto/cline/common"
import { ArrowDownToLineIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { FileServiceClient } from "@/services/grpc-client"
import { createIconButtonProps } from "@/utils/interactiveProps"

const OpenDiskConversationHistoryButton: React.FC<{
	taskId?: string
	className?: string
}> = ({ taskId, className }) => {
	const handleOpenDiskConversationHistory = () => {
		if (!taskId) {
			return
		}

		FileServiceClient.openDiskConversationHistory(StringRequest.create({ value: taskId })).catch((err) => {
			console.error(err)
		})
	}

	return (
		<Tooltip>
			<TooltipContent>Open Conversation History File</TooltipContent>
			<TooltipTrigger className={cn("flex items-center", className)}>
				<Button
					{...createIconButtonProps("Open Disk Conversation History", (e) => {
						e.preventDefault()
						e.stopPropagation()
						handleOpenDiskConversationHistory()
					})}
					size="icon"
					variant="icon">
					<ArrowDownToLineIcon />
				</Button>
			</TooltipTrigger>
		</Tooltip>
	)
}

OpenDiskConversationHistoryButton.displayName = "OpenDiskConversationHistoryButton"
export default OpenDiskConversationHistoryButton
