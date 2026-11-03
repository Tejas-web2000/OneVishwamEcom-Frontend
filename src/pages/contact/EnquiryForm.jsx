import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';
import API from '../../services/api';
import { serviceItems } from '../../constants/servicesContent';
import Field from '../../components/Field';
import { uploadAudioToCloudinary } from '../../utils/uploadAudioToCloudinary';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, isEmailJSConfigured } from '../../config/emailjs';

function EnquiryForm({ loanContext }) {
  const [formData, setFormData] = useState({
    name: '', phone: '', additionalPhone: '', additionalPhone2: '', service: '',
    message: loanContext
      ? `I'm interested in a home loan for ${loanContext.title} (Ref: #${loanContext.id}, Price: ${loanContext.price}). Please connect me.`
      : '',
  });
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioChunksRef = useRef([]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required.';
    if (!formData.phone.trim()) { e.phone = 'Phone number is required.'; }
    else if (!/^\d{10}$/.test(formData.phone)) e.phone = 'Please enter a valid 10-digit number.';
    if (formData.additionalPhone.trim() && !/^\d{10}$/.test(formData.additionalPhone)) e.additionalPhone = 'Invalid number.';
    if (formData.additionalPhone2.trim() && !/^\d{10}$/.test(formData.additionalPhone2)) e.additionalPhone2 = 'Invalid number.';
    if (!formData.service) e.service = 'Please select a service.';
    if (activeTab === 'text') { if (!formData.message.trim()) e.message = 'Message is required.'; }
    else { if (!audioBlob) e.message = 'Please record a voice message or type instead.'; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      Swal.fire({ title: 'Not Supported', text: 'Audio recording is not supported.', icon: 'error', confirmButtonColor: '#1a4b8c' });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 8000 } });
      streamRef.current = stream;
      audioChunksRef.current = [];
      let options = { audioBitsPerSecond: 8000 };
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) options.mimeType = 'audio/webm;codecs=opus';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) options.mimeType = 'audio/mp4';
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      recorder.start(500);
      setIsRecording(true);
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((p) => {
          if (p >= 59) { mediaRecorderRef.current?.stop(); setIsRecording(false); clearInterval(timerIntervalRef.current); return 60; }
          return p + 1;
        });
      }, 1000);
    } catch {
      Swal.fire({ title: 'Microphone Error', text: 'Could not access microphone.', icon: 'warning', confirmButtonColor: '#1a4b8c' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); clearInterval(timerIntervalRef.current); }
  };

  const deleteRecording = () => { setAudioBlob(null); setAudioUrl(''); setRecordingDuration(0); clearInterval(timerIntervalRef.current); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    const selectedService = serviceItems.find((s) => s.id === formData.service)?.title || formData.service;
    setIsSending(true);
    let voicePublicUrl = '';

    if (activeTab === 'voice' && audioBlob) {
      try { const r = await uploadAudioToCloudinary(audioBlob); voicePublicUrl = r.url; }
      catch (err) { setIsSending(false); Swal.fire({ title: 'Upload Failed', text: err.message, icon: 'error', confirmButtonColor: '#1a4b8c' }); return; }
    }

    const templateParams = {
      title: `Enquiry for ${selectedService}`, from_name: formData.name, from_email: 'no-reply@vishwam.com',
      from_phone: formData.phone, from_additional_phone: formData.additionalPhone || 'N/A',
      from_additional_phone_2: formData.additionalPhone2 || 'N/A', service: selectedService,
      message: activeTab === 'text' ? formData.message : '[Voice Message Recorded]', voice_message: voicePublicUrl,
    };

    try {
      // 1. Post to MongoDB Atlas via live Express backend
      try {
        await API.post('/api/enquiries', {
          name: formData.name,
          phone: formData.phone,
          message: `[${selectedService}] ${activeTab === 'text' ? formData.message : '[Voice Message Recorded]'}`,
        });
      } catch (backendErr) {
        console.warn('Backend enquiry save warning:', backendErr);
      }

      // 2. Also send notification email if EmailJS is configured
      if (isEmailJSConfigured()) {
        try {
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
        } catch (emailErr) {
          console.warn('EmailJS delivery warning:', emailErr);
        }
      }

      Swal.fire({ title: 'Success!', text: 'Your enquiry has been submitted.', icon: 'success', confirmButtonColor: '#1a4b8c' });
      setFormData({ name: '', phone: '', additionalPhone: '', additionalPhone2: '', service: '', message: '' });
      deleteRecording();
      setErrors({});
    } catch {
      Swal.fire({ title: 'Oops!', text: 'Something went wrong. Please try again.', icon: 'error', confirmButtonColor: '#1a4b8c' });
    } finally { setIsSending(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'phone' || name === 'additionalPhone' || name === 'additionalPhone2') v = value.replace(/\D/g, '').slice(0, 10);
    else if (name === 'name') v = value.replace(/\d/g, '');
    setFormData((p) => ({ ...p, [name]: v }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  return (
    <form className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm" onSubmit={handleSubmit} noValidate>
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Enquiry Form</p>
      <h2 className="mt-2 text-2xl font-bold text-brand-charcoal">Tell us what you need</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" error={errors.name} />
        <Field label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter 10-digit phone number" error={errors.phone} />
        <Field label="Additional Phone 1" type="tel" name="additionalPhone" value={formData.additionalPhone} onChange={handleChange} placeholder="Optional" error={errors.additionalPhone} />
        <Field label="Additional Phone 2" type="tel" name="additionalPhone2" value={formData.additionalPhone2} onChange={handleChange} placeholder="Optional" error={errors.additionalPhone2} />
        <label className="grid gap-1.5 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Service</span>
          <select name="service" value={formData.service} onChange={handleChange}
            className={`rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-brand-blue ${
              errors.service ? 'border-red-300 text-red-600' : 'border-gray-200 bg-white text-brand-charcoal'
            }`}
          >
            <option value="">Select a service...</option>
            {serviceItems.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          {errors.service && <span className="text-xs text-red-500">{errors.service}</span>}
        </label>
      </div>

      <div className="mt-6 border-b border-gray-100 pb-2 flex gap-4">
        <button type="button" onClick={() => setActiveTab('text')}
          className={`pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'text' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}>Write Query</button>
        <button type="button" onClick={() => setActiveTab('voice')}
          className={`pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'voice' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}>Record Voice</button>
      </div>

      {activeTab === 'text' ? (
        <label className="mt-4 grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Message</span>
          <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Write your requirement..."
            className={`rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-brand-blue ${
              errors.message ? 'border-red-300 text-red-600' : 'border-gray-200 bg-white text-brand-charcoal'
            }`} />
          {errors.message && <span className="text-xs text-red-500">{errors.message}</span>}
        </label>
      ) : (
        <div className="mt-4 p-6 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Voice Message Recorder</span>
          <div className="flex items-center gap-4">
            {isRecording ? (
              <button type="button" onClick={stopRecording}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1.5" /></svg>
              </button>
            ) : (
              <button type="button" onClick={startRecording} disabled={audioUrl !== ''}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-blue hover:bg-brand-navy text-white shadow-lg transition disabled:opacity-40">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </button>
            )}
            {audioUrl && (
              <button type="button" onClick={deleteRecording}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-red-500 hover:bg-gray-100 transition">
                <i className="fa-solid fa-trash-can" />
              </button>
            )}
          </div>
          <div className="text-center text-sm">
            {isRecording ? <span className="text-red-500 animate-pulse flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Recording {recordingDuration}s (Max 60s)</span>
            : audioUrl ? <span className="text-green-600">Recording ready to send ({(audioBlob?.size / 1024).toFixed(1)} KB)</span>
            : <span className="text-gray-400">Click to start recording</span>}
          </div>
          {audioUrl && <audio src={audioUrl} controls className="w-full max-w-xs h-10" />}
          {errors.message && <span className="text-xs text-red-500">{errors.message}</span>}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={isSending}
          className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-brand-navy transition-colors disabled:opacity-60"
        >
          {isSending ? <><i className="fa-solid fa-spinner fa-spin" /> Sending...</> : 'Send Enquiry'}
        </button>
        <p className="text-xs text-gray-400">All fields except Additional Phones are required.</p>
      </div>
    </form>
  );
}

export default EnquiryForm;
