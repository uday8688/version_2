import { supabase } from '@/integrations/supabase/client';

export const createSampleUsers = async () => {
  try {
    const response = await fetch(
      'https://vdpdtgvxhhpinwskhaqu.supabase.co/functions/v1/create-sample-users',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcGR0Z3Z4aGhwaW53c2toYXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTY2MDMsImV4cCI6MjA2NTkzMjYwM30.wUFOifIdr4pGtppxeHWVbQypmCGF7rT0xjbiOciv-fo`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const result = await response.json();
    console.log('Sample users creation result:', result);
    return result;
  } catch (error) {
    console.error('Error creating sample users:', error);
    throw error;
  }
};