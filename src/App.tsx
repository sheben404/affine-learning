import '@blocksuite/editor/themes/affine.css'
import './App.css'
import { Editor } from './components/Editor'
import { useAtomValue, useAtom, useSetAtom } from 'jotai'
import { workspaceIdsAtom, currentWorkspaceIdAtom } from './store'
import { ChangeEvent, Suspense, useCallback, useEffect, useState } from 'react'

const CreateWorkspace = () => {
  const [name, setName] = useState('')
  const setWorkspaceIds = useSetAtom(workspaceIdsAtom)
  return (
    <div>
      No Workspace
      <input
        value={name}
        onChange={useCallback((e: ChangeEvent<HTMLInputElement>) => {
          setName(e.target.value)
        }, [])}
      />
      <button
        onClick={useCallback(() => {
          setWorkspaceIds((ids) => {
            if (!name) return ids
            const set = new Set(ids)
            set.add(name)
            return Array.from(set)
          })
        }, [name, setWorkspaceIds])}>
        Create Workspace
      </button>
    </div>
  )
}

const SwitchWorkspace = () => {
  const ids = useAtomValue(workspaceIdsAtom)
  const setCurrentId = useSetAtom(currentWorkspaceIdAtom)
  return (
    <select
      style={{
        position: 'absolute',
        zIndex: 10000,
      }}
      onChange={useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setCurrentId((id) => {
          return e.target.value
        })
      }, [])}>
      {ids.map((id) => {
        return (
          <option key={id} value={id}>
            {id}
          </option>
        )
      })}
    </select>
  )
}

function App() {
  const ids = useAtomValue(workspaceIdsAtom)
  const [currentWorkspaceId, setCurrentWorkspaceId] = useAtom(currentWorkspaceIdAtom)
  useEffect(() => {
    if (currentWorkspaceId === null && ids.length > 0) {
      setCurrentWorkspaceId(ids[0])
    }
  }, [currentWorkspaceId, ids, setCurrentWorkspaceId])

  if (!currentWorkspaceId) {
    return <CreateWorkspace />
  }
  return (
    <div>
      <SwitchWorkspace />
      <Suspense fallback={<div>loading</div>}>
        <Editor key={currentWorkspaceId} />
      </Suspense>
    </div>
  )
}

export default App
