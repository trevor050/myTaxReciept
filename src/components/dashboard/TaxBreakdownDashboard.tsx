'use client';

import * as React from 'react';
import type { TaxSpending } from '@/services/tax-spending';
import type { SuggestRepresentativesOutput } from '@/ai/flows/suggest-representatives';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Tooltip as ShadTooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


interface TaxBreakdownDashboardProps {
  taxAmount: number;
  taxSpending: TaxSpending[];
  representativeSuggestion: SuggestRepresentativesOutput | null;
}

// Define a color palette - ensure enough colors for categories
const COLORS = ['#008080', '#4DB6AC', '#80CBC4', '#B2DFDB', '#E0F2F1', '#A7FFEB', '#64FFDA'];

// Custom Tooltip for Pie Chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Access the payload item
    const totalAmount = payload[0].payload.totalAmount; // Get total tax amount from payload
    const spendingAmount = (data.percentage / 100) * totalAmount;

    return (
      <div className="bg-background p-2 border border-border rounded shadow-lg text-sm">
        <p className="font-semibold">{`${data.category}`}</p>
        <p>{`Percentage: ${data.percentage.toFixed(1)}%`}</p>
        <p>{`Amount: $${spendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
      </div>
    );
  }

  return null;
};

// Custom Legend
const CustomLegend = (props: any) => {
  const { payload } = props;

  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-4 list-none p-0">
      {payload.map((entry: any, index: number) => {
          const percentage = entry.payload?.percentage; // Access percentage from the payload
          return (
            <li key={`item-${index}`} className="flex items-center">
              <span style={{ backgroundColor: entry.color, width: '10px', height: '10px', display: 'inline-block', marginRight: '5px', borderRadius: '50%' }}></span>
              <span>{entry.value} {percentage ? `(${percentage.toFixed(1)}%)` : ''}</span>
            </li>
          );
      })}
    </ul>
  );
};


export default function TaxBreakdownDashboard({
  taxAmount,
  taxSpending,
  representativeSuggestion,
}: TaxBreakdownDashboardProps) {

  const chartData = taxSpending.map((item) => ({
      ...item,
      totalAmount: taxAmount, // Pass total tax amount to each data point for tooltip calculation
  }));

  const handleContactRepresentatives = () => {
    // TODO: Implement logic to guide user to contact representatives
    // This could open a modal, link to a relevant government website, etc.
    console.log('Contact Representatives action triggered for categories:', representativeSuggestion?.suggestedCategories);
    // Example: Redirecting to a generic government contact page
    window.open('https://www.usa.gov/elected-officials', '_blank');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Your Estimated Tax Breakdown</h2>
      <p className="text-center text-muted-foreground">
        Based on an estimated tax payment of ${taxAmount.toLocaleString()}.
      </p>

       {/* AI Suggestion Alert */}
        {representativeSuggestion?.shouldSuggestRepresentatives && (
            <Alert className="bg-primary/10 border-primary/30 text-primary-foreground">
                 <Info className="h-4 w-4 stroke-primary" />
                <AlertTitle className="font-semibold text-primary">Connect with Your Representatives</AlertTitle>
                <AlertDescription className="text-foreground/80">
                    {representativeSuggestion.reason} Consider contacting your representatives about spending in: {representativeSuggestion.suggestedCategories.join(', ')}.
                     <Button variant="link" className="p-0 h-auto ml-1 text-primary" onClick={handleContactRepresentatives}>
                        Find Officials <ExternalLink className="inline ml-1 h-3 w-3" />
                    </Button>
                </AlertDescription>
            </Alert>
        )}
        {!representativeSuggestion?.shouldSuggestRepresentatives && representativeSuggestion?.reason && (
             <Alert variant="default" className="mt-4">
                 <Info className="h-4 w-4" />
                <AlertTitle>Representative Contact</AlertTitle>
                <AlertDescription>
                    {representativeSuggestion.reason}
                </AlertDescription>
            </Alert>
        )}


      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-center">Spending Categories</CardTitle>
        </CardHeader>
        <CardContent>
            <TooltipProvider>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="category" // Use category name for legend/tooltip default
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        // Only show label if percentage is significant (e.g., > 5%)
                        if (percent * 100 < 5) return null;
                        return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10">
                            {`${(percent * 100).toFixed(0)}%`}
                        </text>
                        );
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                   <Tooltip content={<CustomTooltip />} />
                   <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </TooltipProvider>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground justify-center">
            <TooltipProvider>
                 <ShadTooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center cursor-help">
                          <Info className="h-3 w-3 mr-1" /> Data is estimated and may vary.
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Spending percentages are based on available public data for the region and may not reflect exact allocations.</p>
                    </TooltipContent>
                  </ShadTooltip>
            </TooltipProvider>
        </CardFooter>
      </Card>


      {/* List view of spending */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
          <CardDescription>Estimated amount spent per category.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {taxSpending.sort((a,b) => b.percentage - a.percentage).map((item, index) => {
              const amountSpent = (item.percentage / 100) * taxAmount;
              return (
                <li key={index} className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0">
                  <span className="font-medium">{item.category}</span>
                  <div className="text-right">
                     <span className="font-semibold">${amountSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     <span className="text-muted-foreground ml-2">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>


    </div>
  );
}
