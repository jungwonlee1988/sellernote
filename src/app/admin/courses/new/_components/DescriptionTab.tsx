'use client'

import { useRef } from 'react'
import { Bold, Italic, List, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react'

interface DescriptionTabProps {
  description: string
  setDescription: (value: string) => void
  isUploading: boolean
  onDescriptionImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function DescriptionTab({
  description,
  setDescription,
  isUploading,
  onDescriptionImageUpload,
}: DescriptionTabProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const descriptionImageRef = useRef<HTMLInputElement>(null)

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = description.substring(start, end)
    const newText =
      description.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      description.substring(end)
    setDescription(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          강의 상세 설명 <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          마크다운 문법을 사용할 수 있습니다. 이미지를 삽입하려면 아래 버튼을 클릭하세요.
        </p>
      </div>

      {/* 에디터 툴바 */}
      <div className="flex items-center space-x-1 p-2 bg-gray-50 rounded-t-lg border border-b-0 border-gray-300">
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="p-2 hover:bg-gray-200 rounded"
          title="굵게"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          className="p-2 hover:bg-gray-200 rounded"
          title="기울임"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('\n- ')}
          className="p-2 hover:bg-gray-200 rounded"
          title="목록"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('[링크텍스트](', ')')}
          className="p-2 hover:bg-gray-200 rounded"
          title="링크"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <button
          type="button"
          onClick={() => descriptionImageRef.current?.click()}
          disabled={isUploading}
          className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-200 rounded text-sm"
          title="이미지 삽입"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          <span>이미지 삽입</span>
        </button>
        <input
          ref={descriptionImageRef}
          type="file"
          accept="image/*"
          onChange={onDescriptionImageUpload}
          className="hidden"
        />
      </div>

      <textarea
        ref={textareaRef}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={20}
        placeholder={`강의에 대한 상세 설명을 입력하세요.

마크다운 문법 예시:
# 제목
## 소제목
**굵은 글씨**
*기울임 글씨*
- 목록 항목
[링크](URL)
![이미지 설명](이미지URL)`}
        className="w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50] resize-none font-mono text-sm"
      />

      <p className="mt-2 text-sm text-gray-500">{description.length}자 입력됨</p>
    </div>
  )
}
