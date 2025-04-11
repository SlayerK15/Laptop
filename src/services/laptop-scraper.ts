
/**
 * Represents the details of a laptop.
 */
export interface Laptop {
    /**
     * The name of the laptop.
     */
    name: string;
    /**
     * The URL of the laptop on the e-commerce website.
     */
    url: string;
    /**
     * The price of the laptop in Indian Rupees.
     */
    price: number;
    /**
     * The brand of the Laptop
     */
    brand: string;
  
     /**
     * The processor of the laptop.
     */
    processor?: string;
  
    /**
     * The graphics card of the laptop.
     */
    graphicsCard?: string;
  
    /**
     * The display resolution of the laptop.
     */
    displayResolution?: string;
  
    /**
     * The weight of the laptop.
     */
    weight?: string;
  }
  
  /**
   * Asynchronously retrieves laptop data from a given e-commerce website.
   *
   * @param website The URL of the e-commerce website to scrape.
   * @returns A promise that resolves to an array of Laptop objects.
   */
  import fs from 'fs/promises';
  import path from 'path';
  
  export async function getLaptopsFromCSV(filePath: string): Promise<Laptop[]> {
    try {
      const csvFilePath = path.join(process.cwd(), filePath);
      const csvFileContent = await fs.readFile(csvFilePath, { encoding: 'utf8' });
  
      const lines = csvFileContent.trim().split('\n');
      const header = lines[0].split('\t');  // Assuming tab-separated values
      const data = [];
  
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const laptop: any = {};
  
        for (let j = 0; j < header.length; j++) {
          laptop[header[j].trim()] = values[j].trim();
        }
  
        data.push({
          name: laptop.Name,
          url: laptop.URL,
          price: parseFloat(laptop.Price),
          brand: laptop.Brand,
          processor: laptop.Processor,
          graphicsCard: laptop['Graphics Card'],
          displayResolution: laptop['Display Resolution'],
          weight: laptop.Weight,
        });
      }
  
      return data;
    } catch (error) {
      console.error('Error reading or parsing CSV file:', error);
      return [];
    }
  }
  