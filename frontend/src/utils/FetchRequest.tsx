import { useEffect, useState } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

interface fetchRequestResponse<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
}

export const useFetchRequest= <T,>(
    url: string, 
    method: AxiosRequestConfig['method'] = 'get'
): fetchRequestResponse<T> => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios({
                    url,
                    method
                });
                setData(response.data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, error, loading };
};

export const useFetchRequestDep= <T,>(url: string, deps: any): fetchRequestResponse<T> => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching
            try {
                const response = await axios.get(url);
                // console.log(url + " Fetched data:", response.data);
                setData(response.data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [deps]);

    return { data, error, loading };
};

export const useFetchRequestMount= <T,>(url: string): fetchRequestResponse<T> => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching
            try {
                const response = await axios.get(url);
                // console.log(url + " Fetched data:", response.data);
                setData(response.data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, error, loading };
};

