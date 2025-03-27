"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FileUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface DocumentUploaderProps {
  vaultId: string
  onComplete: () => void
}

export function DocumentUploader({ vaultId, onComplete }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        if (!name) {
          // Set the name to the file name without extension
          setName(selectedFile.name.replace(/\.[^/.]+$/, ""))
        }
      } else {
        alert("Please upload a PDF file")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !name) {
      alert("Please provide a file and name")
      return
    }

    setIsUploading(true)

    try {
      // In a real application, you would upload the file to your server or storage service
      // For example, using FormData and fetch:

      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", name)
      formData.append("description", description)
      formData.append("vaultId", vaultId)

      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Example API call (commented out)
      // const response = await fetch('/api/documents/upload', {
      //   method: 'POST',
      //   body: formData,
      // });

      // if (!response.ok) {
      //   throw new Error('Upload failed');
      // }

      // Reset form
      setFile(null)
      setName("")
      setDescription("")

      // Notify parent component
      onComplete()

      // In a real app, you might want to refresh the documents list
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload document. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="bg-[#202426] border-zinc-800">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document">PDF Document</Label>
            {!file ? (
              <div
                className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
                <p className="text-zinc-400">Click to upload or drag and drop</p>
                <p className="text-xs text-zinc-500 mt-1">PDF (max 10MB)</p>
                <input
                  ref={fileInputRef}
                  id="document"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between bg-zinc-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <FileUp className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={clearFile} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Whitepaper, Audit Report"
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
              className="bg-zinc-800 border-zinc-700 text-white resize-none h-20"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onComplete}
              className="border-zinc-700 hover:bg-zinc-800 text-white"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!file || !name || isUploading}>
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

