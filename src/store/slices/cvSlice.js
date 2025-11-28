// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   currentCV: {
//     basic: {},
//     education: [],
//     experience: [],
//     projects: [],
//     skills: [],
//     social: [],
//   },
//   allCVs: [],  // User's saved CVs
// };

// const cvSlice = createSlice({
//   name: 'cv',
//   initialState,
//   reducers: {
//     setCurrentCV: (state, action) => {
//       state.currentCV = action.payload;
//     },
//     updateCurrentCV: (state, action) => {
//       state.currentCV = { ...state.currentCV, ...action.payload };
//     },
//     resetCurrentCV: (state) => {
//       state.currentCV = initialState.currentCV;
//     },
//     setAllCVs: (state, action) => {
//       state.allCVs = action.payload;
//     },
//     addCV: (state, action) => {
//       state.allCVs.push(action.payload);
//     },
//     updateCVInList: (state, action) => {
//       const index = state.allCVs.findIndex(cv => cv.id === action.payload.id);
//       if (index !== -1) state.allCVs[index] = action.payload;
//     },
//     deleteCV: (state, action) => {
//       state.allCVs = state.allCVs.filter(cv => cv.id !== action.payload);
//     },
//     // ✅ Added saveCV action
//     saveCV: (state, action) => {
//       // Optional: you can implement any logic here (e.g., logging, localStorage)
//       console.log('CV saved:', action.payload);
//     },
//   },
// });

// // Export all actions including saveCV
// export const {
//   setCurrentCV,
//   updateCurrentCV,
//   resetCurrentCV,
//   setAllCVs,
//   addCV,
//   updateCVInList,
//   deleteCV,
//   saveCV // <-- now available
// } = cvSlice.actions;

// // Export reducer
// export default cvSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentCV: {
    basic: {},
    education: [],
    experience: [],
    projects: [],
    skills: [],
    social: [],
  },
  allCVs: [],  // User's saved CVs
};

const cvSlice = createSlice({
  name: 'cv',
  initialState,
  reducers: {
    setCurrentCV: (state, action) => {
      state.currentCV = action.payload;
    },
    updateCurrentCV: (state, action) => {
      state.currentCV = { ...state.currentCV, ...action.payload };
    },
    resetCurrentCV: (state) => {
      state.currentCV = initialState.currentCV;
    },
    setAllCVs: (state, action) => {
      state.allCVs = action.payload;
    },
    addCV: (state, action) => {
      state.allCVs.push(action.payload);
    },
    updateCVInList: (state, action) => {
      const index = state.allCVs.findIndex(cv => cv._id === action.payload._id);
      if (index !== -1) state.allCVs[index] = action.payload;
    },
    deleteCV: (state, action) => {
      state.allCVs = state.allCVs.filter(cv => cv._id !== action.payload);
    },
    saveCV: (state, action) => {
      const index = state.allCVs.findIndex(cv => cv._id === action.payload._id);
      if (index !== -1) state.allCVs[index] = action.payload;
      else state.allCVs.push(action.payload);
      state.currentCV = action.payload;
      console.log('CV saved:', action.payload);
    },
  },
});

export const {
  setCurrentCV,
  updateCurrentCV,
  resetCurrentCV,
  setAllCVs,
  addCV,
  updateCVInList,
  deleteCV,
  saveCV
} = cvSlice.actions;

export default cvSlice.reducer;
