import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';
import Field from '../../components/Field';
import { uploadResumeToCloudinary } from '../../utils/uploadResumeToCloudinary';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, isEmailJSConfigured } from '../../config/emailjs';

const ROLE_SUGGESTIONS = [
  'Business Development',
  'Sales Executive',
  'Property Consultant',
  'Software Engineer',
  'Operations Manager',
  'Finance & Accounts',
];

function ApplicationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    experience: '1-3 Years',
    message: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Full name is required.';
    if (!formData.email.trim()) {
      e.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      e.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      e.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!formData.role.trim()) {
      e.role = 'Please specify the role you are applying for.';
    }
    if (!resumeFile) {
      e.resume = 'Please upload your resume (PDF or DOCX).';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const fileExt = file.name.split('.').pop().toLowerCase();
    const isValidExt = ['pdf', 'doc', 'docx'].includes(fileExt);

    if (!isValidExt && !allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, resume: 'Only PDF, DOC, or DOCX files are allowed.' }));
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, resume: 'File is too large. Maximum size is 5MB.' }));
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setResumeFile(file);
    if (errors.resume) {
      setErrors((prev) => ({ ...prev, resume: undefined }));
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    let resumeUrl = '';

    try {
      const result = await uploadResumeToCloudinary(resumeFile);
      resumeUrl = result.url;
    } catch (err) {
      setIsSubmitting(false);
      Swal.fire({
        title: 'Upload Failed',
        text: 'Could not upload your resume file. Please check your connection and try again.',
        icon: 'error',
        confirmButtonColor: '#1a4b8c',
      });
      return;
    }

    const templateParams = {
      title: 'New Career Application',
      from_name: formData.name,
      from_email: formData.email,
      from_phone: formData.phone,
      service: `Career Interest: ${formData.role} (${formData.experience})`,
      message: `Role: ${formData.role}\nExperience: ${formData.experience}\nNote: ${formData.message || 'None'}\nResume: ${resumeUrl}`,
    };

    if (!isEmailJSConfigured()) {
      Swal.fire({
        title: 'Configuration Error',
        text: 'Email service is not configured. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#1a4b8c',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      Swal.fire({
        title: 'Application Submitted!',
        text: 'Thank you for applying. Our talent acquisition team will review your profile and reach out to you.',
        icon: 'success',
        confirmButtonColor: '#1a4b8c',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        experience: '1-3 Years',
        message: '',
      });
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      Swal.fire({
        title: 'Submission Error',
        text: 'Something went wrong while sending your application. Please try again.',
        icon: 'error',
        confirmButtonColor: '#1a4b8c',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-md"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="border-b border-gray-100 pb-5 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue mb-2">
          <i className="fa-solid fa-paper-plane text-xs" />
          <span>Apply Now</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal">
          Submit Your Profile
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Share your details and resume with us. We'll connect when an opening matches your background.
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            error={errors.name}
          />
          <Field
            label="Email Address *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. rahul@example.com"
            error={errors.email}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Phone Number *"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            error={errors.phone}
          />
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Experience
            </span>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-charcoal outline-none transition focus:border-brand-blue"
            >
              <option value="Fresher / < 1 Year">Fresher / &lt; 1 Year</option>
              <option value="1-3 Years">1 - 3 Years</option>
              <option value="3-5 Years">3 - 5 Years</option>
              <option value="5+ Years">5+ Years</option>
            </select>
          </label>
        </div>

        <div>
          <Field
            label="Role of Interest *"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g. Sales Executive, Property Advisor, Engineer"
            error={errors.role}
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-gray-400 font-medium">Popular roles:</span>
            {ROLE_SUGGESTIONS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, role }));
                  if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                }}
                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                  formData.role === role
                    ? 'border-brand-blue bg-brand-blue text-white font-medium'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-brand-blue/40 hover:bg-brand-blue/5'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Resume File Upload Dropzone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Upload Resume (PDF or DOCX) *
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
              errors.resume
                ? 'border-red-300 bg-red-50/50'
                : isDragging
                ? 'border-brand-blue bg-blue-50/70 scale-[0.99]'
                : resumeFile
                ? 'border-emerald-300 bg-emerald-50/40'
                : 'border-gray-200 bg-gray-50/80 hover:border-brand-blue/40 hover:bg-brand-blue/5'
            }`}
          >
            <input
              id="resume-upload"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {resumeFile ? (
              <div className="flex items-center justify-between w-full max-w-md bg-white border border-emerald-200 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <i className="fa-solid fa-file-pdf text-lg" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{resumeFile.name}</p>
                    <p className="text-xs text-emerald-600 font-medium">
                      {(resumeFile.size / 1024).toFixed(1)} KB · Ready to submit
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  title="Remove file"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 ml-2"
                >
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xl mb-3 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-cloud-arrow-up" />
                </div>
                <p className="text-sm font-semibold text-brand-charcoal">
                  <span className="text-brand-blue underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
              </div>
            )}
          </div>
          {errors.resume && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              <i className="fa-solid fa-circle-exclamation mr-1" />
              {errors.resume}
            </p>
          )}
        </div>

        {/* Optional Note */}
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Cover Note / Message <span className="text-gray-400 font-normal">(Optional)</span>
          </span>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            placeholder="Tell us a little bit about yourself or why you would like to join..."
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-charcoal outline-none transition placeholder:text-gray-400 focus:border-brand-blue resize-none"
          />
        </label>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-brand-navy active:scale-[0.99] transition-all disabled:opacity-60 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" />
                <span>Uploading & Submitting...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane" />
                <span>Submit Application</span>
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
            <i className="fa-solid fa-shield-halved text-xs text-slate-400" />
            <span>Your information is held securely and used solely for recruitment purposes.</span>
          </p>
        </div>
      </div>
    </form>
  );
}

export default ApplicationForm;
