'use server';
/**
 * @fileOverview Analyzes a large amount of laptop data to prepare the laptop database for the AI recommendation engine.
 *
 * - analyzeLaptopData - A function that handles the laptop data analysis process.
 * - AnalyzeLaptopDataInput - The input type for the analyzeLaptopData function.
 * - AnalyzeLaptopDataOutput - The return type for the analyzeLaptopData function.
 */

import {ai} from '@/ai/ai-instance';
import {Laptop} from '@/services/laptop-scraper';
import {z} from 'genkit';

const AnalyzeLaptopDataInputSchema = z.object({
  laptops: z.array(z.object({
    name: z.string().describe('The name of the laptop.'),
    url: z.string().describe('The URL of the laptop on the e-commerce website.'),
    price: z.number().describe('The price of the laptop in Indian Rupees.'),
    brand: z.string().describe('The brand of the Laptop'),
  })).describe('The laptop data to analyze.'),
});
export type AnalyzeLaptopDataInput = z.infer<typeof AnalyzeLaptopDataInputSchema>;

const AnalyzeLaptopDataOutputSchema = z.object({
  analyzedData: z.string().describe('The analyzed laptop data ready for the AI recommendation engine.'),
});
export type AnalyzeLaptopDataOutput = z.infer<typeof AnalyzeLaptopDataOutputSchema>;

export async function analyzeLaptopData(input: AnalyzeLaptopDataInput): Promise<AnalyzeLaptopDataOutput> {
  return analyzeLaptopDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLaptopDataPrompt',
  input: {
    schema: z.object({
      laptops: z.array(z.object({
        name: z.string().describe('The name of the laptop.'),
        url: z.string().describe('The URL of the laptop on the e-commerce website.'),
        price: z.number().describe('The price of the laptop in Indian Rupees.'),
        brand: z.string().describe('The brand of the Laptop'),
      })).describe('The laptop data to analyze.'),
    }),
  },
  output: {
    schema: z.object({
      analyzedData: z.string().describe('The analyzed laptop data ready for the AI recommendation engine.'),
    }),
  },
  prompt: `You are an AI expert in data analysis and preparation for AI recommendation engines.

You are given a list of laptops with their details such as name, URL, price, and brand. However, some data might be missing or inconsistent.

Your task is to analyze this data and prepare it so that it can be used for an AI recommendation engine.

Extract the following specs (if present):
- Processor (Brand and Model)
- Graphics Card (Brand and Model)
- Display Resolution
- Weight

If any information is missing, make reasonable assumptions based on available data and common laptop specifications. If the data is inconsistent, prioritize the most reliable information.

Here is the laptop data:
{{#each laptops}}
- Name: {{{name}}}, URL: {{{url}}}, Price: {{{price}}}, Brand: {{{brand}}}
{{/each}}

Provide the analyzed laptop data, filling in any gaps and resolving inconsistencies and adding any available specs as possible
`,
});

const analyzeLaptopDataFlow = ai.defineFlow<
  typeof AnalyzeLaptopDataInputSchema,
  typeof AnalyzeLaptopDataOutputSchema
>({
  name: 'analyzeLaptopDataFlow',
  inputSchema: AnalyzeLaptopDataInputSchema,
  outputSchema: AnalyzeLaptopDataOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
