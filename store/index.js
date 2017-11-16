export const state = () => ({
  sidebar: false,
  addingThread: false,
  currentBoard: {},
  currentThread: {}
})

export const mutations = {
  toggleSidebar (state) {
    state.sidebar = !state.sidebar
  },
  toggleAddingThread (state) {
    state.addingThread = !state.addingThread
  },
  setCurrentBoard (state, board) {
    state.currentBoard = board
  },
  setCurrentThread (state, thread) {
    state.currentThread = thread
  }
}
