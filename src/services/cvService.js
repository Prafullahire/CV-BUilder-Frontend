// import axiosInstance from "./axiosInstance";
// export const getCVs = async () => {
//   try {
//     const response = await axiosInstance.get("/cv");
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

// export const createCV = async (cvData) => {
//   try {
//     const formattedData = {
//       basic: cvData.basic || {},
//       education: cvData.education || [],
//       experience: cvData.experience || [],
//       projects: cvData.projects || [],
//       skills: cvData.skills || [],
//       social: cvData.social || [],
//     };

//     const response = await axiosInstance.post("/cv", formattedData);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

// export const updateCV = async (cvId, cvData) => {
//   try {
//     const formattedData = {
//       basic: cvData.basic || {},
//       education: cvData.education || [],
//       experience: cvData.experience || [],
//       projects: cvData.projects || [],
//       skills: cvData.skills || [],
//       social: cvData.social || [],
//     };

//     const response = await axiosInstance.put(`/cv/${cvId}`, formattedData);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

// export const deleteCV = async (cvId) => {
//   try {
//     const response = await axiosInstance.delete(`/cv/${cvId}`);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

// export const downloadCV = async (id) => {
//   const response = await fetch(`http://localhost:5000/api/cv/${id}/download`);
//   const blob = await response.blob();
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "my_cv.pdf";
//   a.click();
// };


// export const shareCV = async (cvId, platform) => {
//   try {
//     const response = await axiosInstance.post(`/cv/${cvId}/share`, {
//       platform,
//     });
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

// export const emailCV = async (cvId, email) => {
//   try {
//     const response = await axiosInstance.post(`/cv/${cvId}/email`, {
//       email,
//     });
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

import axiosInstance from "./axiosInstance";

// Convert CV data into FormData
const buildFormData = (cvData, imageFile) => {
  const formData = new FormData();

  formData.append("basic", JSON.stringify(cvData.basic || {}));
  formData.append("education", JSON.stringify(cvData.education || []));
  formData.append("experience", JSON.stringify(cvData.experience || []));
  formData.append("projects", JSON.stringify(cvData.projects || []));
  formData.append("skills", JSON.stringify(cvData.skills || []));
  formData.append("social", JSON.stringify(cvData.social || []));

  if (imageFile) formData.append("image", imageFile);

  return formData;
};

// GET all CVs
export const getCVs = async () => {
  const response = await axiosInstance.get("/cv");
  return response.data;
};

// CREATE CV
export const createCV = async (cvData, imageFile) => {
  const formData = buildFormData(cvData, imageFile);

  const response = await axiosInstance.post("/cv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// UPDATE CV
export const updateCV = async (cvId, cvData, imageFile) => {
  const formData = buildFormData(cvData, imageFile);

  const response = await axiosInstance.put(`/cv/${cvId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// DELETE CV
export const deleteCV = async (cvId) => {
  const response = await axiosInstance.delete(`/cv/${cvId}`);
  return response.data;
};

// DOWNLOAD PDF
export const downloadCV = async (id) => {
  const response = await fetch(`http://localhost:5000/api/cv/${id}/download`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "my_cv.pdf";
  a.click();
};

// SHARE CV
export const shareCV = async (cvId, platform) => {
  const response = await axiosInstance.post(`/cv/${cvId}/share`, { platform });
  return response.data;
};

// EMAIL CV
export const emailCV = async (cvId, email) => {
  const response = await axiosInstance.post(`/cv/${cvId}/email`, { email });
  return response.data;
};

