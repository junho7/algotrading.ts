import { UserFormData } from "./types";

// interface DataParams {
//   ticker: string;
//   // fromDate: string;
//   endDate: string;
//   duration: string;
//   timeAggregation: string;
// }

export const saveData = async (params: UserFormData) => {
  const url = new URL('http://localhost:7007/loadData');
  
  // Append parameters as query strings
  url.search = new URLSearchParams({...params}).toString();

  console.log('url.toString(): ', url.toString())

  try {
    const response = await fetch(url.toString(), {
      method: 'GET', // or 'POST' if the API expects a POST request
      headers: {
        'Content-Type': 'application/json',
        // Include other headers as needed
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    console.log('response: ', response)
    const data = await response.text();
    console.log('data: ', data)
    return data;
  } catch (error) {
    console.error('Error fetching data from API:', error);
    throw error;
  }
};

export const backtest = async (params: UserFormData) => {
  const url = new URL('http://localhost:7007/backtest');
  
  // Append parameters as query strings
  url.search = new URLSearchParams({...params}).toString();

  try {
    const response = await fetch(url.toString(), {
      method: 'GET', // or 'POST' if the API expects a POST request
      headers: {
        'Content-Type': 'application/json',
        // Include other headers as needed
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data from API:', error);
    throw error;
  }
};
