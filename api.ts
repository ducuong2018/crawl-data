import Axios from "axios";
interface IApiResponse<T> {
    status: number
    body: T
}
export default function getRequest(url: string): Promise<IApiResponse<any>> {
    console.log(url);

    const headers: { [key: string]: string } = {};
    headers['Content-Type'] = 'application/json';
    return new Promise<any>(resolve => {
        Axios.get(
            url,
        )
            .then(next => {
                resolve({
                    body: next.data,
                    status: next.status
                })
            })
            .catch(error => {
            });
    });
}