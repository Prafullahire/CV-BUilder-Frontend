import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import { updateCurrentCV, saveCV } from "../store/slices/cvSlice";
import { createCV, updateCV } from "../services/cvService";
import axios from "axios";

const isValidObjectId = (id) =>
  typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

const steps = [
  "Basic Details",
  "Education",
  "Experience",
  "Projects",
  "Skills",
  "Social Profiles",
];

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
  2: {
    education: {
      required: true,
      message: "At least one education entry is required",
      minLength: 1,
    },
  },
  3: {
    experience: {
      required: true,
      message: "At least one experience entry is required",
      minLength: 1,
    },
  },
  4: {
    projects: {
      required: true,
      message: "At least one project entry is required",
      minLength: 1,
    },
  },
  5: {
    skills: {
      required: true,
      message: "At least one skill entry is required",
      minLength: 1,
    },
  },
  6: {
    social: {
      required: true,
      message: "At least one social profile is required",
      minLength: 1,
    },
  },
};

const Editor = () => {
  const { cvId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentCV = useSelector((state) => state.cv.currentCV) || {};

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [cardLoading, setCardLoading] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState({});

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
      introductionParagraph: "",
    },
    education: Array.isArray(currentCV.education) ? currentCV.education : [],
    experience: Array.isArray(currentCV.experience) ? currentCV.experience : [],
    projects: Array.isArray(currentCV.projects) ? currentCV.projects : [],
    skills: Array.isArray(currentCV.skills) ? currentCV.skills : [],
    social: Array.isArray(currentCV.social) ? currentCV.social : [],
    layout: currentCV.layout || {
      font: "Arial",
      size: 14,
      color: "#000",
      bgColor: "#f8f9fa",
    },
  };

  // Validate current step
  const validateStep = (stepNumber) => {
    const rules = validationRules[stepNumber];
    const newErrors = {};

    if (!rules) return true;

    Object.keys(rules).forEach((fieldPath) => {
      const rule = rules[fieldPath];
      const [section, field] = fieldPath.split(".");

      let value;
      if (
        section === "education" ||
        section === "experience" ||
        section === "projects" ||
        section === "skills" ||
        section === "social"
      ) {
        value = safeCV[section];
      } else {
        value = safeCV[section]?.[field];
      }

      if (rule.required) {
        if (Array.isArray(value)) {
          if (rule.minLength && value.length < rule.minLength) {
            newErrors[fieldPath] = rule.message;
          }
        } else if (
          !value ||
          (typeof value === "string" && value.trim() === "")
        ) {
          newErrors[fieldPath] = rule.message;
        }
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        newErrors[fieldPath] = rule.patternMessage || "Invalid format";
      }
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

  const handleChange = (section, field, value, index = null) => {
    setIsDirty(true);

    const fieldPath =
      index !== null ? `${section}[${index}].${field}` : `${section}.${field}`;
    clearError(fieldPath);

    if (index !== null) {
      const updatedArray = [...safeCV[section]];
      updatedArray[index] = { ...updatedArray[index], [field]: value };
      dispatch(updateCurrentCV({ [section]: updatedArray }));
    } else {
      dispatch(
        updateCurrentCV({ [section]: { ...safeCV[section], [field]: value } })
      );
    }
  };

  const handleAddItem = (section, newItem = {}) => {
    setIsDirty(true);
    clearError(section);
    dispatch(updateCurrentCV({ [section]: [...safeCV[section], newItem] }));
  };

  const handleDeleteItem = (section, index) => {
    setIsDirty(true);
    const updatedArray = safeCV[section].filter((_, i) => i !== index);
    dispatch(updateCurrentCV({ [section]: updatedArray }));
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      const firstError = document.querySelector(".text-danger");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSave = async () => {
    let allValid = true;
    for (let i = 1; i <= steps.length; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setStep(i);
        alert(`Please complete all required fields in ${steps[i - 1]}`);
        break;
      }
    }

    if (!allValid) return;

    setSaving(true);
    try {
      const imageFile =
        safeCV.basic.image instanceof File ? safeCV.basic.image : null;

      let response;

      if (isValidObjectId(cvId)) {
        const formData = new FormData();
        formData.append(
          "basic",
          JSON.stringify({ ...safeCV.basic, image: undefined })
        );
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
      alert(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };
const handlePaymentAction = async (action) => {
  try {
    let useId = isValidObjectId(cvId) ? cvId : currentCV._id;

    if (!useId) {
      // Agar CV save nahi hua → pehle save karo
      const formData = new FormData();
      formData.append(
        "basic",
        JSON.stringify({ ...safeCV.basic, image: undefined })
      );
      if (safeCV.basic.image instanceof File)
        formData.append("image", safeCV.basic.image);
      formData.append("education", JSON.stringify(safeCV.education));
      formData.append("experience", JSON.stringify(safeCV.experience));
      formData.append("projects", JSON.stringify(safeCV.projects));
      formData.append("skills", JSON.stringify(safeCV.skills));
      formData.append("social", JSON.stringify(safeCV.social));
      formData.append("layout", JSON.stringify(safeCV.layout));
      const savedCV = await createCV(formData);
      dispatch(saveCV(savedCV));
      useId = savedCV._id;
      setIsDirty(false);
    }

    setCardLoading((prev) => ({ ...prev, [action]: true }));

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    if (action === "download") {
      const { data } = await axios.post(
        `${API_URL}/payment/create-checkout-session`,
        { cvId: useId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Open payment/checkout in new tab → current page safe
      window.open(data.url, "_blank");
    } else if (action === "share") {
      const { data } = await axios.get(`${API_URL}/cv/${useId}/share`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shareLink = data.link;
      alert(`Payment Successful! Share link: ${shareLink}`);
    }
  } catch (err) {
    console.error("Payment Error:", err);
    alert(err.message || "Payment failed");
  } finally {
    setCardLoading((prev) => ({ ...prev, [action]: false }));
  }
};

  // const handlePaymentAction = async (action) => {
  //   try {
  //     let useId = isValidObjectId(cvId) ? cvId : currentCV._id;

  //     if (!useId) {
  //       const formData = new FormData();
  //       formData.append(
  //         "basic",
  //         JSON.stringify({ ...safeCV.basic, image: undefined })
  //       );
  //       if (safeCV.basic.image instanceof File)
  //         formData.append("image", safeCV.basic.image);
  //       formData.append("education", JSON.stringify(safeCV.education));
  //       formData.append("experience", JSON.stringify(safeCV.experience));
  //       formData.append("projects", JSON.stringify(safeCV.projects));
  //       formData.append("skills", JSON.stringify(safeCV.skills));
  //       formData.append("social", JSON.stringify(safeCV.social));
  //       formData.append("layout", JSON.stringify(safeCV.layout));
  //       const savedCV = await createCV(formData);
  //       dispatch(saveCV(savedCV));
  //       useId = savedCV._id;
  //       setIsDirty(false);
  //     }

  //     setCardLoading((prev) => ({ ...prev, [action]: true }));

  //     const API_URL = import.meta.env.VITE_API_URL;

  //     if (action === "download") {
  //       const token = localStorage.getItem("token");

  //       const response = await axios.post(
  //         `${API_URL}/payment/create-checkout-session`,
  //         { cvId: useId, action },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       window.location.href = response.data.url;
  //       const { url } = response.data;
  //       window.location.href = url;
  //     } else if (action === "share") {
  //       const token = localStorage.getItem("token");
  //       const { data } = await axios.get(`${API_URL}/cv/${useId}/share`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       const shareLink = data.link;
  //       alert(`Payment Successful! Share link: ${shareLink}`);
  //     }
  //   } catch (err) {
  //     console.error("Payment Error:", err);
  //     alert(err.message || "Payment failed");
  //   } finally {
  //     setCardLoading((prev) => ({ ...prev, [action]: false }));
  //   }
  // };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <FormInput
              label={
                <>
                  Name <span className="text-danger">*</span>
                </>
              }
              value={safeCV.basic.name}
              onChange={(e) => handleChange("basic", "name", e.target.value)}
            />
            {errors["basic.name"] && (
              <div className="text-danger small mb-2">
                {errors["basic.name"]}
              </div>
            )}

            <FormInput
              label={
                <>
                  Email <span className="text-danger">*</span>
                </>
              }
              value={safeCV.basic.email}
              onChange={(e) => handleChange("basic", "email", e.target.value)}
            />
            {errors["basic.email"] && (
              <div className="text-danger small mb-2">
                {errors["basic.email"]}
              </div>
            )}

            <FormInput
              label={
                <>
                  Phone <span className="text-danger">*</span>
                </>
              }
              value={safeCV.basic.phone}
              onChange={(e) => handleChange("basic", "phone", e.target.value)}
            />
            {errors["basic.phone"] && (
              <div className="text-danger small mb-2">
                {errors["basic.phone"]}
              </div>
            )}

            <FormInput
              label="Address"
              value={safeCV.basic.address}
              onChange={(e) => handleChange("basic", "address", e.target.value)}
            />

            <FormInput
              label="City"
              value={safeCV.basic.city}
              onChange={(e) => handleChange("basic", "city", e.target.value)}
            />

            <FormInput
              label="State"
              value={safeCV.basic.state}
              onChange={(e) => handleChange("basic", "state", e.target.value)}
            />

            <FormInput
              label="Pincode"
              value={safeCV.basic.pincode}
              onChange={(e) => handleChange("basic", "pincode", e.target.value)}
            />

            <FormInput
              label="Designation"
              value={safeCV.basic.intro}
              onChange={(e) => handleChange("basic", "intro", e.target.value)}
            />

            <FormInput
              label={
                <>
                  Profile Image <span className="text-danger">*</span>
                </>
              }
              type="file"
              onChange={(e) =>
                handleChange("basic", "image", e.target.files[0])
              }
            />
            {errors["basic.image"] && (
              <div className="text-danger small mb-2">
                {errors["basic.image"]}
              </div>
            )}
            <hr />

            <FormInput
              label="Introduction Paragraph"
              type="textarea"
              value={safeCV.basic.introductionParagraph || ""}
              onChange={(e) =>
                handleChange("basic", "introductionParagraph", e.target.value)
              }
            />
            <hr />
            <h5>Layout Customization</h5>

            <div className="row mb-2">
              <div className="col-md-6">
                <FormInput
                  label="Font Family"
                  value={safeCV.layout.font}
                  onChange={(e) =>
                    handleChange("layout", "font", e.target.value)
                  }
                />
              </div>
              <div className="col-md-6">
                <FormInput
                  label="Font Size"
                  type="number"
                  value={safeCV.layout.size}
                  onChange={(e) =>
                    handleChange("layout", "size", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <FormInput
                  label="Font Color"
                  type="color"
                  value={safeCV.layout.color}
                  onChange={(e) =>
                    handleChange("layout", "color", e.target.value)
                  }
                  style={{
                    width: "40px",
                    height: "40px",
                    padding: 0,
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div className="col-md-6">
                <FormInput
                  label="Background Color"
                  type="color"
                  value={safeCV.layout.bgColor}
                  onChange={(e) =>
                    handleChange("layout", "bgColor", e.target.value)
                  }
                  style={{
                    width: "40px",
                    height: "40px",
                    padding: 0,
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            {errors["education"] && (
              <div className="alert alert-danger mb-3">
                {errors["education"]}
              </div>
            )}
            {safeCV.education.map((edu, i) => (
              <div key={i} className="border p-2 mb-2">
                <FormInput
                  label="Degree"
                  value={edu.degree || ""}
                  onChange={(e) =>
                    handleChange("education", "degree", e.target.value, i)
                  }
                />
                <FormInput
                  label="Institution"
                  value={edu.institution || ""}
                  onChange={(e) =>
                    handleChange("education", "institution", e.target.value, i)
                  }
                />
                <FormInput
                  label="Percentage"
                  value={edu.percentage || ""}
                  onChange={(e) =>
                    handleChange("education", "percentage", e.target.value, i)
                  }
                />
                <Button
                  text="Delete"
                  variant="danger"
                  onClick={() => handleDeleteItem("education", i)}
                  className="mt-1"
                />
              </div>
            ))}
          </>
        );
      case 3:
        return safeCV.experience.map((exp, i) => (
          <div key={i} className="border p-2 mb-2">
            <FormInput
              label="Organization"
              value={exp.organization || ""}
              onChange={(e) =>
                handleChange("experience", "organization", e.target.value, i)
              }
            />
            <FormInput
              label="Position"
              value={exp.position || ""}
              onChange={(e) =>
                handleChange("experience", "position", e.target.value, i)
              }
            />
            <FormInput
              label="CTC"
              value={exp.ctc || ""}
              onChange={(e) =>
                handleChange("experience", "ctc", e.target.value, i)
              }
            />
            <FormInput
              label="Joining Date"
              type="date"
              value={exp.joiningDate || ""}
              onChange={(e) =>
                handleChange("experience", "joiningDate", e.target.value, i)
              }
            />
            <FormInput
              label="Leaving Date"
              type="date"
              value={exp.leavingDate || ""}
              onChange={(e) =>
                handleChange("experience", "leavingDate", e.target.value, i)
              }
            />
            <FormInput
              label="Technologies"
              value={exp.technologies || ""}
              onChange={(e) =>
                handleChange("experience", "technologies", e.target.value, i)
              }
            />
            <Button
              text="Delete"
              variant="danger"
              onClick={() => handleDeleteItem("experience", i)}
              className="mt-1"
            />
          </div>
        ));
      case 4:
        return safeCV.projects.map((proj, i) => (
          <div key={i} className="border p-2 mb-2">
            <FormInput
              label="Project Title"
              value={proj.title || ""}
              onChange={(e) =>
                handleChange("projects", "title", e.target.value, i)
              }
            />
            <FormInput
              label="Team Size"
              value={proj.teamSize || ""}
              onChange={(e) =>
                handleChange("projects", "teamSize", e.target.value, i)
              }
            />
            <FormInput
              label="Duration"
              value={proj.duration || ""}
              onChange={(e) =>
                handleChange("projects", "duration", e.target.value, i)
              }
            />
            <FormInput
              label="Technologies"
              value={proj.technologies || ""}
              onChange={(e) =>
                handleChange("projects", "technologies", e.target.value, i)
              }
            />
            <FormInput
              label="Description"
              value={proj.description || ""}
              onChange={(e) =>
                handleChange("projects", "description", e.target.value, i)
              }
            />
            <Button
              text="Delete"
              variant="danger"
              onClick={() => handleDeleteItem("projects", i)}
              className="mt-1"
            />
          </div>
        ));
      case 5:
        return safeCV.skills.map((skill, i) => (
          <div key={i} className="border p-2 mb-2">
            <FormInput
              label="Skill Name"
              value={skill.name || ""}
              onChange={(e) =>
                handleChange("skills", "name", e.target.value, i)
              }
            />
            <FormInput
              label="Proficiency (%)"
              type="number"
              value={skill.percentage || ""}
              onChange={(e) =>
                handleChange("skills", "percentage", e.target.value, i)
              }
            />
            <Button
              text="Delete"
              variant="danger"
              onClick={() => handleDeleteItem("skills", i)}
              className="mt-1"
            />
          </div>
        ));
      case 6:
        return safeCV.social.map((social, i) => (
          <div key={i} className="border p-2 mb-2">
            <FormInput
              label="Platform"
              value={social.platform || ""}
              onChange={(e) =>
                handleChange("social", "platform", e.target.value, i)
              }
            />
            <FormInput
              label="Profile Link"
              value={social.link || ""}
              onChange={(e) =>
                handleChange("social", "link", e.target.value, i)
              }
            />
            <Button
              text="Delete"
              variant="danger"
              onClick={() => handleDeleteItem("social", i)}
              className="mt-1"
            />
          </div>
        ));
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        {/* Stepper */}
        <div className="d-flex justify-content-between mb-4">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`text-center ${
                step === i + 1 ? "fw-bold text-primary" : "text-secondary"
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => setStep(i + 1)}
            >
              {i + 1}. {s}
            </div>
          ))}
        </div>

        <div className="row">
          {/* Form */}
          <div className="col-md-6">
            {renderStep()}

            <div className="mt-3">
              {step > 1 && (
                <Button
                  text="Previous"
                  onClick={handlePrev}
                  variant="secondary"
                  className="me-2"
                />
              )}
              {step < steps.length && (
                <Button text="Next" onClick={handleNext} variant="primary" />
              )}
              {step === steps.length && (
                <>
                  <Button
                    text={saving ? "Saving..." : "Save"}
                    onClick={handleSave}
                    variant="success"
                    className="me-2"
                    disabled={saving}
                  />
                  <Button
                    text={cardLoading.download ? "Processing..." : "Download"}
                    onClick={() => handlePaymentAction("download")}
                    variant="primary"
                    className="me-2"
                    disabled={cardLoading.download}
                  />
                  <Button
                    text={cardLoading.share ? "Processing..." : "Share"}
                    onClick={() => handlePaymentAction("share")}
                    variant="secondary"
                    disabled={cardLoading.share}
                  />
                </>
              )}
            </div>

            {/* Add Item Buttons */}
            {step === 2 && (
              <Button
                text="Add Education"
                variant="success"
                onClick={() =>
                  handleAddItem("education", {
                    degree: "",
                    institution: "",
                    percentage: "",
                  })
                }
                className="mt-2"
              />
            )}
            {step === 3 && (
              <Button
                text="Add Experience"
                variant="success"
                onClick={() =>
                  handleAddItem("experience", {
                    organization: "",
                    position: "",
                    ctc: "",
                    joiningDate: "",
                    leavingDate: "",
                    technologies: "",
                  })
                }
                className="mt-2"
              />
            )}
            {step === 4 && (
              <Button
                text="Add Project"
                variant="success"
                onClick={() =>
                  handleAddItem("projects", {
                    title: "",
                    teamSize: "",
                    duration: "",
                    technologies: "",
                    description: "",
                  })
                }
                className="mt-2"
              />
            )}
            {step === 5 && (
              <Button
                text="Add Skill"
                variant="success"
                onClick={() =>
                  handleAddItem("skills", { name: "", percentage: "" })
                }
                className="mt-2"
              />
            )}
            {step === 6 && (
              <Button
                text="Add Social Profile"
                variant="success"
                onClick={() =>
                  handleAddItem("social", { platform: "", link: "" })
                }
                className="mt-2"
              />
            )}
          </div>

          {/* CV Preview */}
          
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
              {safeCV.basic.image && (
                <img
                  src={
                    safeCV.basic.image instanceof File
                      ? URL.createObjectURL(safeCV.basic.image)
                      : safeCV.basic.image
                  }
                  alt="Profile"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                  }}
                />
              )}
              <p>
                <h4>{safeCV.basic.intro}</h4>
              </p>
              <p>
                {safeCV.basic.introductionParagraph}
              </p>
              <p>
                <h5> {safeCV.basic.name}</h5>
              </p>
              <p>
                <strong>{safeCV.basic.email}</strong> 
              </p>
              <p>
                <strong>{safeCV.basic.phone}</strong>
              </p>
              

              <hr />
              <h5>Education</h5>
              {safeCV.education.map((edu, i) => (
                <p key={i}>
                  {edu.degree} - {edu.institution} ({edu.percentage}%)
                </p>
              ))}

              <hr />
              <h5>Experience</h5>
              {safeCV.experience.map((exp, i) => (
                <p key={i}>
                  {exp.position} at {exp.organization} ({exp.joiningDate} -{" "}
                  {exp.leavingDate})
                </p>
              ))}

              <hr />
              <h5>Projects</h5>
              {safeCV.projects.map((proj, i) => (
                <p key={i}>
                  {proj.title} - {proj.duration}
                </p>
              ))}

              <hr />
              <h5>Skills</h5>
              {safeCV.skills.map((skill, i) => (
                <p key={i}>
                  {skill.name} ({skill.percentage}%)
                </p>
              ))}

              <hr />
              <h5>Social Profiles</h5>
              {safeCV.social.map((s, i) => (
                <p key={i}>
                  {s.platform}: {s.link}
                </p>
              ))}
            </div>
          </div>

          
        </div>
      </div>
    </>
  );
};

export default Editor;
