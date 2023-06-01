import '@blocksuite/editor/themes/affine.css'
import './App.css'
import { Editor } from './components/Editor'
import { useAtomValue, useAtom } from 'jotai'
import { workspaceIdsAtom, currentWorkspaceIdAtom } from './store'
import { Suspense } from 'react'

function App() {
  const ids = useAtomValue(workspaceIdsAtom)
  const [currentWorkspaceId, setCurrentWorkspaceId] = useAtom(currentWorkspaceIdAtom)
  if (currentWorkspaceId === null && ids.length > 0) {
    setCurrentWorkspaceId(ids[0])
  }
  if (!currentWorkspaceId) {
    return <div>No Workspace</div>
  }
  return (
    <div>
      <Suspense fallback={<div>loading</div>}>
        <Editor />
      </Suspense>
    </div>
  )
}

export default App
