import { AffineSchemas } from '@blocksuite/blocks/dist/models.js'
import { EditorContainer } from '@blocksuite/editor'
import { Workspace, assertExists } from '@blocksuite/store/src/index'
import { atom, createStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { createIndexedDBProvider } from '@toeverything/y-indexeddb'

const editorContainerAtom = atom<Promise<typeof EditorContainer>>(async () => {
  const { EditorContainer } = await import('@blocksuite/editor')
  return EditorContainer
})

export const rootStore = createStore()

export const workspaceIdsAtom = atomWithStorage<string[]>('workspaces', [])

workspaceIdsAtom.onMount = (set) => {
  if (localStorage.getItem('workspaces') === null) {
    set(['demo-workspace'])
  }
}

export const currentWorkspaceIdAtom = atom<string | null>(null)

class WorkspaceMap extends Map<string, Workspace> {
  public indexedDBProviders: Map<string, ReturnType<typeof createIndexedDBProvider>> = new Map()

  override set(workspaceId: string, workspace: Workspace) {
    if (this.has(workspaceId)) return this
    const provider = createIndexedDBProvider(workspaceId, workspace.doc)
    this.indexedDBProviders.set(workspaceId, provider)
    provider.connect()
    provider.whenSynced.then(() => {
      if (workspace.isEmpty) {
        const page = workspace.createPage({
          id: 'page0',
        })

        const pageBlockId = page.addBlock('affine:page', {
          title: new Text(),
        })

        page.addBlock('affine:surface', {}, null)

        // Add frame block inside page block
        const frameId = page.addBlock('affine:frame', {}, pageBlockId)
        // Add paragraph block inside frame block
        page.addBlock('affine:paragraph', {}, frameId)
        page.resetHistory()
      } else {
        const page = workspace.getPage('page0')
        assertExists(page)
      }
    })
    return super.set(workspaceId, workspace)
  }

  override get(workspaceId: string) {
    return super.get(workspaceId)
  }
}

const hashMap = new WorkspaceMap()

const currentWorkspaceAtom = atom<Promise<Workspace | null>>(async (get) => {
  const id = get(currentWorkspaceIdAtom)
  if (!id) return null
  let workspace = hashMap.get(id)
  if (!workspace) {
    workspace = new Workspace({
      id,
    })
    workspace.register(AffineSchemas)
    hashMap.set(id, workspace)
  }
  const provider = hashMap.indexedDBProviders.get(workspace.id)
  assertExists(provider)
  await provider.whenSynced
  return workspace
})

let prevWorkspace: Workspace | null = null
rootStore.sub(currentWorkspaceAtom, async () => {
  if (prevWorkspace) {
    // cleanup providers
    const provider = await hashMap.indexedDBProviders.get(prevWorkspace.id)
    assertExists(provider)
    provider.disconnect()
  }
  prevWorkspace = await rootStore.get(currentWorkspaceAtom)
})

export const editorAtom = atom<Promise<EditorContainer | null>>(async (get) => {
  const currentWorkspace = await get(currentWorkspaceAtom)
  if (!currentWorkspace) return null
  const EditorContainer = await get(editorContainerAtom)
  const editor = new EditorContainer()
  const page = currentWorkspace.getPage('page0')
  assertExists(page)
  editor.page = page
  return editor
})
