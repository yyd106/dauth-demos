import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface CounterState {
    activedItem: string
}

const initialState: CounterState = {
  activedItem: 'email'
}


export const verifiedDataSlice = createSlice({
  name: 'verifiedData',
  initialState,
  reducers: {
    updateActivedItem: (state, action: PayloadAction<string>) => {
        state.activedItem = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const {updateActivedItem } = verifiedDataSlice.actions

export default verifiedDataSlice.reducer