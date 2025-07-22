// pages/resume/choose.tsx
import React from 'react';
import { useRouter } from 'next/router';
import Header from '../../Components/Header';
export default function ChooseResumePage() {
  const router = useRouter();

  const handleTemplateSelect = (templateId: string) => {
    router.push(`/resume/create?template=${templateId}`);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:4000/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        router.push({
          pathname: '/resume/create',
          query: { fromPdf: 'true', data: JSON.stringify(data) },
        });
      } else {
        alert('PDF parsing failed. Please try a different file.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Create a Resume</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Choose a Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl cursor-pointer border border-gray-200"
                onClick={() => handleTemplateSelect(`template-${id}`)}
              >
                <div className="h-48 bg-gray-50 rounded mb-3 flex items-center justify-center text-gray-400 text-lg">
                  Template {id}
                </div>
                <p className="text-sm text-gray-600">Professional, clean layout</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Or Upload Your Existing Resume (PDF)</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            className="block w-full border border-gray-300 rounded p-2 bg-white"
          />
          <p className="text-sm text-gray-500 mt-1">We'll try to parse your PDF and pre-fill the resume form.</p>
        </div>
      </div>
    </div>
  );
}
