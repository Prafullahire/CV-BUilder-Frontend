// src/pages/EditViewCV.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import { updateCurrentCV, saveCV } from "../store/slices/cvSlice";
import { createCV, updateCV } from "../services/cvService";
import axios from "axios";

const steps = ["Basic Details", "Education", "Experience", "Projects", "Skills", "Social Profiles"];

const validationRules = {
  1: {
    "basic.name": { required: true, message: "Name is required" },
    "basic.email": {
      required: true,
      message: "Email is required",
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: "Invalid email format",
    },
    "basic.phone": {
      required: true,
      message: "Phone is required",
      pattern: /^[0-9]{10}$/,
      patternMessage: "Phone must be 10 digits",
    },
    "basic.image": { required: true, message: "Profile image is required" },
  },
  2: { education: { required: true, message: "At least one education entry is required", minLength: 1 } },
  3: { experience: { required: true, message: "At least one experience entry is required", minLength: 1 } },
  4: { projects: { required: true, message: "At least one project entry is required", minLength: 1 } },
  5: { skills: { required: true, message: "At least one skill entry is required", minLength: 1 } },
  6: { social: { required: true, message: "At least one social profile is required", minLength: 1 } },
};

const EditViewCV = () => {
  const { cvId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedCV = useSelector((state) => state.cv.currentCV);
  const currentCV = useMemo(() => selectedCV || {}, [selectedCV]);

  const readOnly =
    location.pathname.includes("/view/") || new URLSearchParams(location.search).get("mode") === "view";

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingCV, setLoadingCV] = useState(false);

  // Initialize safeCV
  const safeCV = {
    basic: currentCV.basic || {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      intro: "",
      image: null,
      imageUrl: "",
    },
    education: Array.isArray(currentCV.education) ? currentCV.education : [],
    experience: Array.isArray(currentCV.experience) ? currentCV.experience : [],
    projects: Array.isArray(currentCV.projects) ? currentCV.projects : [],
    skills: Array.isArray(currentCV.skills) ? currentCV.skills : [],
    social: Array.isArray(currentCV.social) ? currentCV.social : [],
    layout: currentCV.layout || { font: "Arial", size: 14, color: "#000", bgColor: "#f8f9fa" },
  };

  // Step validation
  const validateStep = (stepNumber) => {
    const rules = validationRules[stepNumber];
    const newErrors = {};
    if (!rules) return true;

    Object.keys(rules).forEach((fieldPath) => {
      const rule = rules[fieldPath];
      const [section, field] = fieldPath.split(".");
      let value;
      if (["education", "experience", "projects", "skills", "social"].includes(section)) value = safeCV[section];
      else value = safeCV[section]?.[field];

      if (rule.required) {
        if (Array.isArray(value)) {
          if (rule.minLength && value.length < rule.minLength) newErrors[fieldPath] = rule.message;
        } else if (!value || (typeof value === "string" && value.trim() === "")) newErrors[fieldPath] = rule.message;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) newErrors[fieldPath] = rule.patternMessage || "Invalid format";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (fieldPath) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldPath];
      return newErrors;
    });
  };

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Fetch CV safely
  useEffect(() => {
    const fetchCV = async () => {
      if (!cvId) return;

      // Compare as strings
      if (currentCV && (currentCV._id?.toString() === cvId || currentCV.id?.toString() === cvId)) return;

      setLoadingCV(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/cv/${cvId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (data) dispatch(saveCV(data));
      } catch (err) {
        console.error("Fetch CV error:", err.response?.data || err.message);
        if (!readOnly) alert("Failed to load CV");
      } finally {
        setLoadingCV(false);
      }
    };
    fetchCV();
  }, [cvId, currentCV, dispatch, readOnly]);

  // Handle field change
  const handleChange = (section, field, value, index = null) => {
    if (readOnly) return;
    setIsDirty(true);
    clearError(index !== null ? `${section}[${index}].${field}` : `${section}.${field}`);

    if (index !== null) {
      const updatedArray = [...safeCV[section]];
      updatedArray[index] = { ...updatedArray[index], [field]: value };
      dispatch(updateCurrentCV({ [section]: updatedArray }));
    } else dispatch(updateCurrentCV({ [section]: { ...safeCV[section], [field]: value } }));
  };

  const handleAddItem = (section, newItem = {}) => {
    if (readOnly) return;
    setIsDirty(true);
    clearError(section);
    dispatch(updateCurrentCV({ [section]: [...safeCV[section], newItem] }));
  };

  const handleDeleteItem = (section, index) => {
    if (readOnly) return;
    setIsDirty(true);
    const updatedArray = safeCV[section].filter((_, i) => i !== index);
    dispatch(updateCurrentCV({ [section]: updatedArray }));
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((prev) => Math.min(prev + 1, steps.length));
  };
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSave = async () => {
    if (readOnly) return;

    for (let i = 1; i <= steps.length; i++)
      if (!validateStep(i)) {
        setStep(i);
        alert(`Please complete all required fields in ${steps[i - 1]}`);
        return;
      }

    setSaving(true);
    try {
      const imageFile = safeCV.basic.image instanceof File ? safeCV.basic.image : null;
      let response;

      if (cvId) {
        const formData = new FormData();
        formData.append("basic", JSON.stringify({ ...safeCV.basic, image: undefined }));
        if (imageFile) formData.append("image", imageFile);
        formData.append("education", JSON.stringify(safeCV.education));
        formData.append("experience", JSON.stringify(safeCV.experience));
        formData.append("projects", JSON.stringify(safeCV.projects));
        formData.append("skills", JSON.stringify(safeCV.skills));
        formData.append("social", JSON.stringify(safeCV.social));
        formData.append("layout", JSON.stringify(safeCV.layout));

        response = await updateCV(cvId, formData);
        alert("CV Updated Successfully");
      } else {
        response = await createCV(safeCV, imageFile);
        alert("CV Created Successfully");
        const newId = response?._id || response?.id || response?.insertedId;
        if (newId) navigate(`/editor/${newId}`);
      }

      dispatch(saveCV(response));
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Render step fields
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <FormInput label="Name" value={safeCV.basic.name} onChange={(v) => handleChange("basic", "name", v)} readOnly={readOnly} error={errors["basic.name"]} />
            <FormInput label="Email" value={safeCV.basic.email} onChange={(v) => handleChange("basic", "email", v)} readOnly={readOnly} error={errors["basic.email"]} />
            <FormInput label="Phone" value={safeCV.basic.phone} onChange={(v) => handleChange("basic", "phone", v)} readOnly={readOnly} error={errors["basic.phone"]} />
            <FormInput label="Intro" value={safeCV.basic.intro} onChange={(v) => handleChange("basic", "intro", v)} readOnly={readOnly} error={errors["basic.intro"]} />
            {!readOnly && <FormInput type="file" label="Profile Image" onChange={(e) => handleChange("basic", "image", e.target.files[0])} />}
          </>
        );
      case 2:
        return safeCV.education.map((edu, i) => (
          <div key={i} className="mb-2 border p-2">
            <FormInput label="Degree" value={edu.degree} onChange={(v) => handleChange("education", "degree", v, i)} readOnly={readOnly} />
            <FormInput label="Institute" value={edu.institute} onChange={(v) => handleChange("education", "institute", v, i)} readOnly={readOnly} />
            {!readOnly && <Button text="Delete" onClick={() => handleDeleteItem("education", i)} />}
          </div>
        )).concat(!readOnly ? <Button key="addEdu" text="Add Education" onClick={() => handleAddItem("education", { degree: "", institute: "" })} /> : []);
      case 3:
        return safeCV.experience.map((exp, i) => (
          <div key={i} className="mb-2 border p-2">
            <FormInput label="Company" value={exp.company} onChange={(v) => handleChange("experience", "company", v, i)} readOnly={readOnly} />
            <FormInput label="Role" value={exp.role} onChange={(v) => handleChange("experience", "role", v, i)} readOnly={readOnly} />
            {!readOnly && <Button text="Delete" onClick={() => handleDeleteItem("experience", i)} />}
          </div>
        )).concat(!readOnly ? <Button key="addExp" text="Add Experience" onClick={() => handleAddItem("experience", { company: "", role: "" })} /> : []);
      case 4:
        return safeCV.projects.map((p, i) => (
          <div key={i} className="mb-2 border p-2">
            <FormInput label="Project Name" value={p.name} onChange={(v) => handleChange("projects", "name", v, i)} readOnly={readOnly} />
            <FormInput label="Description" value={p.desc} onChange={(v) => handleChange("projects", "desc", v, i)} readOnly={readOnly} />
            {!readOnly && <Button text="Delete" onClick={() => handleDeleteItem("projects", i)} />}
          </div>
        )).concat(!readOnly ? <Button key="addProj" text="Add Project" onClick={() => handleAddItem("projects", { name: "", desc: "" })} /> : []);
      case 5:
        return safeCV.skills.map((s, i) => (
          <div key={i} className="mb-2 border p-2">
            <FormInput label="Skill" value={s.name} onChange={(v) => handleChange("skills", "name", v, i)} readOnly={readOnly} />
            {!readOnly && <Button text="Delete" onClick={() => handleDeleteItem("skills", i)} />}
          </div>
        )).concat(!readOnly ? <Button key="addSkill" text="Add Skill" onClick={() => handleAddItem("skills", { name: "" })} /> : []);
      case 6:
        return safeCV.social.map((s, i) => (
          <div key={i} className="mb-2 border p-2">
            <FormInput label="Platform" value={s.platform} onChange={(v) => handleChange("social", "platform", v, i)} readOnly={readOnly} />
            <FormInput label="Link" value={s.link} onChange={(v) => handleChange("social", "link", v, i)} readOnly={readOnly} />
            {!readOnly && <Button text="Delete" onClick={() => handleDeleteItem("social", i)} />}
          </div>
        )).concat(!readOnly ? <Button key="addSocial" text="Add Social" onClick={() => handleAddItem("social", { platform: "", link: "" })} /> : []);
      default:
        return null;
    }
  };

  if (loadingCV) return <><Navbar /><div className="container mt-5">Loading CV...</div></>;

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="d-flex justify-content-between mb-4">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`text-center ${step === i + 1 ? "fw-bold text-primary" : "text-secondary"}`}
              style={{ cursor: "pointer" }}
              onClick={() => setStep(i + 1)}
            >
              {i + 1}. {s}
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col-md-6">{renderStep()}</div>

          <div className="col-md-6">
            <h4>Preview</h4>
            <div
              className="border p-3"
              style={{
                minHeight: "500px",
                backgroundColor: safeCV.layout.bgColor,
                color: safeCV.layout.color,
                fontFamily: safeCV.layout.font,
                fontSize: safeCV.layout.size + "px",
              }}
            >
              {safeCV.basic.name && <h2>{safeCV.basic.name}</h2>}
              {safeCV.basic.email && <p>Email: {safeCV.basic.email}</p>}
              {safeCV.basic.phone && <p>Phone: {safeCV.basic.phone}</p>}
              {safeCV.basic.intro && <p>{safeCV.basic.intro}</p>}
              {safeCV.education.length > 0 && (
                <>
                  <h4>Education</h4>
                  <ul>{safeCV.education.map((edu, i) => <li key={i}>{edu.degree} - {edu.institute}</li>)}</ul>
                </>
              )}
              {safeCV.experience.length > 0 && (
                <>
                  <h4>Experience</h4>
                  <ul>{safeCV.experience.map((exp, i) => <li key={i}>{exp.role} @ {exp.company}</li>)}</ul>
                </>
              )}
              {safeCV.projects.length > 0 && (
                <>
                  <h4>Projects</h4>
                  <ul>{safeCV.projects.map((p, i) => <li key={i}>{p.name}: {p.desc}</li>)}</ul>
                </>
              )}
              {safeCV.skills.length > 0 && (
                <>
                  <h4>Skills</h4>
                  <ul>{safeCV.skills.map((s, i) => <li key={i}>{s.name}</li>)}</ul>
                </>
              )}
              {safeCV.social.length > 0 && (
                <>
                  <h4>Social</h4>
                  <ul>{safeCV.social.map((s, i) => <li key={i}>{s.platform}: {s.link}</li>)}</ul>
                </>
              )}
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="d-flex justify-content-between mt-4">
            <Button text="Prev" onClick={handlePrev} disabled={step === 1} />
            <Button text="Next" onClick={handleNext} disabled={step === steps.length} />
            <Button text={saving ? "Saving..." : "Save"} onClick={handleSave} disabled={saving} />
          </div>
        )}
      </div>
    </>
  );
};

export default EditViewCV;
