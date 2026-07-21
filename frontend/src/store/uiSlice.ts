import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  composeOpen: boolean;
  selectedField: string | null;
  activeFeedType: 'latest' | 'trending' | 'following' | 'recommended';
  editPostData: any | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  composeOpen: false,
  selectedField: null,
  activeFeedType: 'latest',
  editPostData: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleCompose(state) {
      state.composeOpen = !state.composeOpen;
      if (!state.composeOpen) {
        state.editPostData = null;
      }
    },
    setComposeOpen(state, action: PayloadAction<boolean>) {
      state.composeOpen = action.payload;
      if (!action.payload) {
        state.editPostData = null;
      }
    },
    setSelectedField(state, action: PayloadAction<string | null>) {
      state.selectedField = action.payload;
    },
    setActiveFeedType(state, action: PayloadAction<UIState['activeFeedType']>) {
      state.activeFeedType = action.payload;
    },
    setEditPostData(state, action: PayloadAction<any | null>) {
      state.editPostData = action.payload;
    }
  }
});

export const { 
  toggleSidebar, setSidebarOpen, toggleCompose, setComposeOpen, 
  setSelectedField, setActiveFeedType, setEditPostData 
} = uiSlice.actions;

export default uiSlice.reducer;
