import { useAtomValue } from 'jotai'
import { useRef } from 'react'
import { editorAtom } from '../store'

export const Editor = () => {
  const ref = useRef<HTMLDivElement>(null)
  const editor = useAtomValue(editorAtom)
  if (ref.current && ref.current.childNodes.length === 0 && editor) {
    const div = ref.current
    div.appendChild(editor)
  }
  return <div ref={ref} id='editor-container' />
}
