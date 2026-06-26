import { useRef, useState } from 'react';
import { Upload, FileCheck, X } from 'lucide-react';
import { uploadApi } from '../api/modules';
import './FileUpload.css';

/**
 * @param {string} value - current file_url, if any
 * @param {(url: string, fileName: string) => void} onChange
 * @param {string} accept - e.g. "image/*" or ".pdf,.doc,.docx"
 */
export default function FileUpload({ value, onChange, accept, label = 'Upload file' }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const response = await uploadApi.uploadFile(file, setProgress);
      onChange(response.data.data.file_url, response.data.data.file_name);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="file-upload">
      {value ? (
        <div className="file-upload-current">
          <FileCheck size={16} />
          <a href={`${import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000'}${value}`} target="_blank" rel="noreferrer">
            {value.split('/').pop()}
          </a>
          <button type="button" className="file-upload-clear" onClick={() => onChange('', '')} aria-label="Remove file">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button type="button" className="file-upload-button" onClick={() => inputRef.current?.click()}>
          <Upload size={16} /> {label}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {progress !== null && <div className="file-upload-progress">Uploading… {progress}%</div>}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
