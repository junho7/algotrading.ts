import { UserFormData } from "./types";

export const saveData = async (params: UserFormData) => {
  const url = new URL("http://localhost:7007/loadData");

  url.search = new URLSearchParams({
    ...params,
    duration: params["duration"].toString(),
  }).toString();

  console.log("url.toString(): ", url.toString());

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
};

export const backtest = async (params: UserFormData) => {
  const url = new URL("http://localhost:7007/backtest");

  url.search = new URLSearchParams({
    ...params,
    duration: params["duration"].toString(),
  }).toString();

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
};
