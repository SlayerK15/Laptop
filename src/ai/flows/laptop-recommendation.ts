'use server';

/**
 * @fileOverview This file defines the Genkit flow for laptop recommendations based on user questionnaire responses.
 *
 * - LaptopRecommendationInput: The input type for the laptop recommendation flow, representing user preferences.
 * - LaptopRecommendationOutput: The output type for the flow, containing a list of recommended laptops.
 * - recommendLaptops: An exported function to trigger the laptop recommendation flow.
 */

import {ai} from '@/ai/ai-instance';
import {getLaptopsFromCSV} from '@/services/laptop-scraper';
import {Laptop} from '@/types/laptop';
import {z} from 'genkit';

const LaptopRecommendationInputSchema = z.object({
  budget: z.number().describe('The maximum budget for the laptop in Indian Rupees.'),
  usage: z.string().describe('The primary usage of the laptop (e.g., gaming, work, personal).'),
  desiredFeatures: z.string().describe('The desired features of the laptop (e.g., long battery life, large screen, lightweight).'),
});
export type LaptopRecommendationInput = z.infer<typeof LaptopRecommendationInputSchema>;

const LaptopRecommendationOutputSchema = z.array(z.object({
    name: z.string().describe('The name of the laptop.'),
    url: z.string().describe('The URL of the laptop on the e-commerce website.'),
    price: z.number().describe('The price of the laptop in Indian Rupees.'),
    brand: z.string().describe('The brand of the Laptop'),
    processor: z.string().optional().describe('The processor of the laptop.'),
    graphicsCard: z.string().optional().describe('The graphics card of the laptop.'),
    displayResolution: z.string().optional().describe('The display resolution of the laptop.'),
    weight: z.string().optional().describe('The weight of the laptop.')
  })
);
export type LaptopRecommendationOutput = z.infer<typeof LaptopRecommendationOutputSchema>;

export async function recommendLaptops(input: LaptopRecommendationInput): Promise<LaptopRecommendationOutput> {
  return recommendLaptopsFlow(input);
}

const laptopRecommendationPrompt = ai.definePrompt({
  name: 'laptopRecommendationPrompt',
  input: {
    schema: z.object({
      budget: z.number().describe('The maximum budget for the laptop in Indian Rupees.'),
      usage: z.string().describe('The primary usage of the laptop (e.g., gaming, work, personal).'),
      desiredFeatures: z.string().describe('The desired features of the laptop (e.g., long battery life, large screen, lightweight).'),
      laptops: z.string().describe('A JSON string representation of available laptops.'),
    }),
  },
  output: {
    schema: z.array(z.object({
      name: z.string().describe('The name of the laptop.'),
      url: z.string().describe('The URL of the laptop on the e-commerce website.'),
      price: z.number().describe('The price of the laptop in Indian Rupees.'),
      brand: z.string().describe('The brand of the Laptop'),
      processor: z.string().optional().describe('The processor of the laptop.'),
      graphicsCard: z.string().optional().describe('The graphics card of the laptop.'),
      displayResolution: z.string().optional().describe('The display resolution of the laptop.'),
      weight: z.string().optional().describe('The weight of the laptop.')
    })),
  },
  prompt: `Given the user's needs and a list of available laptops, recommend the best laptops for the user.

User Needs:
- Budget: {{budget}}
- Usage: {{usage}}
- Desired Features: {{desiredFeatures}}

Available Laptops: {{{laptops}}}

Consider the user's budget, usage, and desired features when making your recommendations. Only include laptops that are within the user's budget.

For each laptop include: Name, Brand, Price, Processor, Graphics Card, Display Resolution and Weight.

Return the laptops as a JSON array.
`,
});

const recommendLaptopsFlow = ai.defineFlow<
  typeof LaptopRecommendationInputSchema,
  typeof LaptopRecommendationOutputSchema
>({
  name: 'recommendLaptopsFlow',
  inputSchema: LaptopRecommendationInputSchema,
  outputSchema: LaptopRecommendationOutputSchema,
}, async input => {
  // Scrape laptop data from e-commerce websites.
  const allLaptops:Laptop[] = await getLaptopsFromCSV('./data.csv');


    // Filter laptops based on user's budget
  const filteredLaptops = allLaptops.filter(laptop => laptop.price <= input.budget);

  // Convert the filtered laptops to JSON string

  if(filteredLaptops.length==0){
    return [];
  }

  //check if no filtered laptop

  

  const laptops = filteredLaptops;
  const laptopsJSON = JSON.stringify(laptops);

    const {output} = await laptopRecommendationPrompt({
    ...input,
    laptops: laptopsJSON,
  });

  // Return the recommended laptops.
  return output!;
});
