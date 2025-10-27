
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Schema definitions
const basicInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and hyphens"),
  category: z.string().min(1, "Please select a category"),
  countryOfBirth: z.string().min(1, "Please select your country"),
  languages: z.array(
    z.object({
      language: z.string(),
      level: z.string(),
    })
  ).min(1, "Please add at least one language"),
  phoneNumber: z.string().optional(),
  ageConfirmation: z.boolean().refine((val) => val === true, "You must confirm you are over 18"),
});

const serviceTypesSchema = z.object({
  oneOnOneSession: z.boolean().optional(),
  chatAdvice: z.boolean().optional(),
  digitalProducts: z.boolean().optional(),
  notes: z.boolean().optional(),
});

const availabilitySchema = z.object({
  availability: z.array(
    z.object({
      day: z.string(),
      slots: z.array(
        z.object({
          start: z.string(),
          end: z.string(),
        })
      ).optional(),
    })
  ).optional(),
});

const pricingSchema = z.object({
  servicePricing: z.object({
    oneOnOneSession: z.object({
      enabled: z.boolean().optional(),
      price: z.number().min(0, "Price must be positive").optional(),
      hasFreeDemo: z.boolean().optional(),
    }).optional(),
    chatAdvice: z.object({
      enabled: z.boolean().optional(),
      price: z.number().min(0, "Price must be positive").optional(),
      hasFreeDemo: z.boolean().optional(),
    }).optional(),
    digitalProducts: z.object({
      enabled: z.boolean().optional(),
      price: z.number().min(0, "Price must be positive").optional(),
    }).optional(),
    notes: z.object({
      enabled: z.boolean().optional(),
      price: z.number().min(0, "Price must be positive").optional(),
    }).optional(),
  }),
});

const profileDescriptionSchema = z.object({
  introduction: z.string().min(50, "Please write at least 50 characters").max(400, "Introduction must be less than 400 characters"),
  teachingExperience: z.string().min(50, "Please write at least 50 characters").max(400, "Teaching experience must be less than 400 characters"),
  motivation: z.string().min(50, "Please write at least 50 characters").max(400, "Motivation must be less than 400 characters"),
  headline: z.string().min(10, "Headline must be at least 10 characters").max(100, "Headline must be less than 100 characters"),
});

const teachingCertificationSchema = z.object({
  hasNoCertificate: z.boolean().optional(),
  teachingCertifications: z.array(
    z.object({
      subject: z.string().min(1, "Subject is required"),
      certificateName: z.string().min(1, "Certificate name is required"),
      description: z.string().optional(),
      issuedBy: z.string().min(1, "Issued by is required"),
      yearFrom: z.string().min(1, "Start year is required"),
      yearTo: z.string().optional(),
      certificateFile: z.any().optional(),
      certificateUrl: z.string().optional(),
      isVerified: z.boolean().optional(),
    })
  ).optional(),
});

const educationSchema = z.object({
  education: z.array(
    z.object({
      degree: z.string().min(1, "Degree is required"),
      university: z.string().min(1, "University is required"),
      subject: z.string().min(1, "Subject is required"),
      yearFrom: z.string().min(1, "Start year is required"),
      yearTo: z.string().optional(),
      currentlyStudying: z.boolean().optional(),
    })
  ).min(1, "Please add at least one education entry"),
});

const profileSetupSchema = z.object({
  profilePicture: z.any().optional(),
  profilePictureUrl: z.string().optional(),
  socialLinks: z.object({
    linkedin: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    instagram: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    twitter: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
  }).optional(),
});

export const formSchema = z.object({
  ...basicInfoSchema.shape,
  ...teachingCertificationSchema.shape,
  ...educationSchema.shape,
  ...profileDescriptionSchema.shape,
  ...serviceTypesSchema.shape,
  ...availabilitySchema.shape,
  ...pricingSchema.shape,
  ...profileSetupSchema.shape,
});

export type FormValues = z.infer<typeof formSchema>;

export function useExpertOnboardingForm() {
  return useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      category: "",
      countryOfBirth: "",
      languages: [],
      phoneNumber: "",
      ageConfirmation: false,
      hasNoCertificate: false,
      teachingCertifications: [],
      education: [],
      introduction: "",
      teachingExperience: "",
      motivation: "",
      headline: "",
      oneOnOneSession: false,
      chatAdvice: false,
      digitalProducts: false,
      notes: false,
      availability: [],
      servicePricing: {
        oneOnOneSession: { enabled: false, price: 0, hasFreeDemo: false },
        chatAdvice: { enabled: false, price: 0, hasFreeDemo: false },
        digitalProducts: { enabled: false, price: 0 },
        notes: { enabled: false, price: 0 },
      },
      profilePictureUrl: "",
      socialLinks: {
        linkedin: "",
        instagram: "",
        twitter: "",
      },
    },
    mode: "onChange",
  });
}
