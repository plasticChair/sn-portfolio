import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    category: z.string().min(1),
    year: z.number().int().min(2000).max(2100).optional(),
    status: z.enum(['Complete', 'In progress', 'Prototype', 'Design documented']).optional(),
    tags: z.array(z.string()).min(1),
    image: z.string().regex(/^\/images\/.+\.(webp|png|jpe?g|avif|svg)$/i, 'Use a local /images/ asset').optional(),
    imageAlt: z.string().min(1).optional(),
    imagePosition: z.string().default('center'),
    gallery: z.array(z.object({
      src: z.string().regex(/^\/images\/.+\.(webp|png|jpe?g|avif|svg)$/i, 'Use a local /images/ asset'),
      alt: z.string().min(1),
      caption: z.string().min(1),
    })).default([]),
    video: z.string().regex(/^\/videos\/.+\.(mp4|webm)$/i, 'Use a local /videos/ asset').optional(),
    videoPoster: z.string().regex(/^\/images\/.+\.(webp|png|jpe?g|avif|svg)$/i, 'Use a local /images/ asset').optional(),
    videoCaption: z.string().default('Project demonstration'),
    featured: z.boolean().default(false),
    order: z.number().default(100),
    draft: z.boolean().default(false),
    demo: z.boolean().default(false),
    role: z.string().default('Design & development'),
    duration: z.string().optional(),
    tools: z.array(z.string()).default([]),
    outcomes: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    links: z.array(z.object({ label: z.string(), url: z.url({ protocol: /^https?$/ }) })).default([]),
  }).refine((data) => !data.image || Boolean(data.imageAlt), {
    message: 'A project image needs descriptive imageAlt text', path: ['imageAlt'],
  }),
});

export const collections = { projects };