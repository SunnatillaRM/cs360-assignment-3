import axios, { AxiosResponse } from 'axios';

// all references to axios are localized here

const inputPort = process.env.PORT || 4001;
let axiosClient = axios.create({ baseURL: `http://localhost:${inputPort}` });

export function setBaseURL(baseURL: string) {
  axiosClient = axios.create({ baseURL: baseURL });
}

export async function remoteGet<T>(path: string): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosClient.get(path);
    return response.data;
  } catch (e) {
    throw new Error(e);
  }
}

export async function remoteDelete<T>(path: string): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosClient.delete(path);
    return response.data;
  } catch (e) {
    throw new Error(e);
  }
}

export async function remotePost<T>(path: string, data?: object): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axiosClient.post(path, data);
    return response.data;
  } catch (e) {
    throw new Error(e);
  }
}
