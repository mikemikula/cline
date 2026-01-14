import { cn } from "@heroui/react"
import { StringRequest } from "@shared/proto/cline/common"
import React, { memo, useLayoutEffect, useRef, useState } from "react"
import { useWindowSize } from "react-use"
import { FileServiceClient } from "@/services/grpc-client"
import { createBaseButtonProps, createButtonStyle, createIconButtonProps } from "@/utils/interactiveProps"

interface ThumbnailsProps {
	images: string[]
	files: string[]
	style?: React.CSSProperties
	setImages?: React.Dispatch<React.SetStateAction<string[]>>
	setFiles?: React.Dispatch<React.SetStateAction<string[]>>
	onHeightChange?: (height: number) => void
	className?: string
}

const Thumbnails = ({ images, files, style, setImages, setFiles, onHeightChange, className }: ThumbnailsProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<string | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const { width } = useWindowSize()

	useLayoutEffect(() => {
		if (containerRef.current) {
			let height = containerRef.current.clientHeight
			// some browsers return 0 for clientHeight
			if (!height) {
				height = containerRef.current.getBoundingClientRect().height
			}
			onHeightChange?.(height)
		}
		setHoveredIndex(null)
	}, [images, files, width, onHeightChange])

	const handleDeleteImages = (index: number) => {
		setImages?.((prevImages) => prevImages.filter((_, i) => i !== index))
	}

	const handleDeleteFiles = (index: number) => {
		setFiles?.((prevFiles) => prevFiles.filter((_, i) => i !== index))
	}

	const isDeletableImages = setImages !== undefined
	const isDeletableFiles = setFiles !== undefined

	const handleImageClick = (image: string) => {
		FileServiceClient.openImage(StringRequest.create({ value: image })).catch((err) =>
			console.error("Failed to open image:", err),
		)
	}

	const handleFileClick = (filePath: string) => {
		FileServiceClient.openFile(StringRequest.create({ value: filePath })).catch((err) =>
			console.error("Failed to open file:", err),
		)
	}

	return (
		<div
			className={cn("flex flex-wrap", className)}
			ref={containerRef}
			style={{
				gap: 5,
				rowGap: 3,
				...style,
			}}>
			{images.map((image, index) => (
				<div key={image} style={{ position: "relative" }}>
					<button
						{...createBaseButtonProps(`Open image ${index + 1}`, () => handleImageClick(image))}
						onMouseEnter={() => setHoveredIndex(image)}
						onMouseLeave={() => setHoveredIndex(null)}
						style={createButtonStyle.icon({ width: 34, height: 34 })}>
						<img
							alt={`Thumbnail image-${index + 1}`}
							src={image}
							style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
						/>
					</button>
					{isDeletableImages && hoveredIndex === image && (
						<button
							{...createIconButtonProps(`Delete image ${index + 1}`, () => handleDeleteImages(index))}
							style={createButtonStyle.icon({
								position: "absolute",
								top: -4,
								right: -4,
								width: 13,
								height: 13,
								borderRadius: "50%",
								backgroundColor: "var(--vscode-badge-background)",
								justifyContent: "center",
							})}>
							<span
								className="codicon codicon-close"
								style={{ color: "var(--vscode-foreground)", fontSize: 10, fontWeight: "bold" }}
							/>
						</button>
					)}
				</div>
			))}

			{files.map((filePath, index) => {
				const fileName = filePath.split(/[\\/]/).pop() || filePath

				return (
					<div key={filePath} style={{ position: "relative" }}>
						<button
							{...createBaseButtonProps(`Open file: ${fileName}`, () => handleFileClick(filePath))}
							onMouseEnter={() => setHoveredIndex(filePath)}
							onMouseLeave={() => setHoveredIndex(null)}
							style={{
								...createButtonStyle.flexReset(),
								width: 34,
								height: 34,
								borderRadius: 4,
								backgroundColor: "var(--vscode-editor-background)",
								border: "1px solid var(--vscode-input-border)",
								flexDirection: "column",
								justifyContent: "center",
							}}>
							<span className="codicon codicon-file" style={{ fontSize: 16, color: "var(--vscode-foreground)" }} />
							<span
								style={{
									fontSize: 7,
									marginTop: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									maxWidth: "90%",
									whiteSpace: "nowrap",
									textAlign: "center",
								}}
								title={fileName}>
								{fileName}
							</span>
						</button>
						{isDeletableFiles && hoveredIndex === filePath && (
							<button
								{...createIconButtonProps(`Delete file: ${fileName}`, () => handleDeleteFiles(index))}
								style={createButtonStyle.icon({
									position: "absolute",
									top: -4,
									right: -4,
									width: 13,
									height: 13,
									borderRadius: "50%",
									backgroundColor: "var(--vscode-badge-background)",
									justifyContent: "center",
								})}>
								<span
									className="codicon codicon-close"
									style={{ color: "var(--vscode-foreground)", fontSize: 10, fontWeight: "bold" }}
								/>
							</button>
						)}
					</div>
				)
			})}
		</div>
	)
}

export default memo(Thumbnails)
