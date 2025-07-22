import {useForm } from 'react-hook-form';
import z, { email } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';

const resumeSchema = z.object({

    title: z.string().min(1, "Title is required"),
    name : z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10, "Phone number must be at least 10 characters long"),
    area: z.string().optional,        
    city: z.string().optional,
    country: z.string().optional,
    summary: z.string().min(1, "Summary is required"),
    skills: z.string(),
    education: z.string(),
    experience: z.string(),
    projects: z.string(),
    certifications: z.string(),
    languages: z.string(),
    interests: z.string(),
})

type ResumeFormData = z.infer<typeof resumeSchema>;

export default function CreateResume() {

    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResumeFormData>({
        resolver: zodResolver(resumeSchema),
    });

    const onSubmit = async (data: ResumeFormData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

              await axios.post(
                "http://localhost:4000/api/resumes",
                {...data,
                    skills: data.skills.split(",").map((s) => s.trim()),
                    education: JSON.parse(data.education || "[]"),
                    experience: JSON.parse(data.experience || "[]"),
                    projects: JSON.parse(data.projects || "[]"),
                    certifications: JSON.parse(data.certifications || "[]"),
                    languages: JSON.parse(data.languages || "[]"),
                    interests: JSON.parse(data.interests || "[]"),
                },
               {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push("/dashboard"); // after successful create
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Resume</h1>

      {errorMessage && (
        <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" {...register("title")} error={errors.title?.message} />
        <Input label="Name" {...register("name")} error={errors.name?.message} />
        <Input label="Email" {...register("email")} error={errors.email?.message} />
        <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
        <Input label="Area" {...register("area")} />
        <Input label="City" {...register("city")} />
        <Input label="Country" {...register("country")} />
        <TextArea label="Summary" {...register("summary")} error={errors.summary?.message} />
        <Input label="Skills (comma separated)" {...register("skills")} />

        <TextArea label="Education (JSON format)" {...register("education")} />
        <TextArea label="Experience (JSON format)" {...register("experience")} />
        <TextArea label="Projects (JSON format)" {...register("projects")} />
        <TextArea label="Certifications (JSON format)" {...register("certifications")} />
        <TextArea label="Languages (JSON format)" {...register("languages")} />
        <TextArea label="Interests (JSON format)" {...register("interests")} />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Resume
        </button>
      </form>
    </div>
  );
}

// Input component

const Input = ({
  label,
  error,
  ...rest
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block font-medium">{label}</label>
    <input {...rest} className="border p-2 w-full rounded mt-1" />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

// Reusable TextArea component
const TextArea = ({
  label,
  error,
  ...rest
}: { label: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div>
    <label className="block font-medium">{label}</label>
    <textarea {...rest} className="border p-2 w-full rounded mt-1" rows={4} />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);