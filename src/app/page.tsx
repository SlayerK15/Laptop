'use client';

import {recommendLaptops} from '@/ai/flows/laptop-recommendation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Laptop} from '@/services/laptop-scraper';
import {useState} from 'react';

export default function Home() {
  const [budget, setBudget] = useState<number | null>(null);
  const [usage, setUsage] = useState('');
  const [desiredFeatures, setDesiredFeatures] = useState('');
  const [recommendations, setRecommendations] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRecommendation = async () => {
    setLoading(true);
    try {
      if (budget === null) {
        alert('Please enter a valid budget.');
        return;
      }

      const laptopRecommendations = await recommendLaptops({
        budget: budget,
        usage: usage,
        desiredFeatures: desiredFeatures,
      });
      setRecommendations(laptopRecommendations);
    } catch (error) {
      console.error('Error during laptop recommendation:', error);
      alert('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Laptop Suggester</h1>

      {/* User Needs Questionnaire */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Tell us about your needs</CardTitle>
          <CardDescription>Fill out the questionnaire to get personalized laptop recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="budget">Budget (INR)</Label>
            <Input
              type="number"
              id="budget"
              placeholder="Enter your budget"
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="usage">Primary Usage</Label>
            <Input
              type="text"
              id="usage"
              placeholder="e.g., Gaming, Work, Personal"
              onChange={(e) => setUsage(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="features">Desired Features</Label>
            <Input
              type="text"
              id="features"
              placeholder="e.g., Long battery life, Large screen, Lightweight"
              onChange={(e) => setDesiredFeatures(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRecommendation} disabled={loading}>
            {loading ? 'Suggesting...' : 'Get Recommendations'}
          </Button>
        </CardFooter>
      </Card>

      {/* Laptop Display */}
      {recommendations.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Recommended Laptops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((laptop, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{laptop.name}</CardTitle>
                  <CardDescription>Brand: {laptop.brand}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Price: INR {laptop.price}</p>
                  {laptop.processor && <p>Processor: {laptop.processor}</p>}
                  {laptop.graphicsCard && <p>Graphics Card: {laptop.graphicsCard}</p>}
                  {laptop.displayResolution && <p>Display: {laptop.displayResolution}</p>}
                  {laptop.weight && <p>Weight: {laptop.weight}</p>}
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <a href={laptop.url} target="_blank" rel="noopener noreferrer">
                      View Details
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      {(recommendations.length === 0) && !loading && (
        <p>No recommendations available. Please fill the form and click on Get Recommendations</p>
      )}
    </div>
  );
}
