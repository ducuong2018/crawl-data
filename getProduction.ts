import axios from "axios";
import fs from "fs";
export interface ICategoreis {
    name: string | undefined | null
    image: string | undefined | null
    parentsName: string | undefined | null
    level: number | null,
    id: number,
    slug: string,
}
interface IProduct {
    category: {
        slug: string
    }
    products: {
        name: string,
        longDescription: string,
        description: string,
        images: { url: string }[],
        slug: string,
        salePrice?: string,
        price: string,
    }[]
}
const main = async () => {
    const { status, body } = await getRequest('http://localhost:8082/v1/category');
    let categories: ICategoreis[] = status === 200 ? body : [];
    categories = categories.filter(item => item.level === 3);
    for (let i = 152; i < categories.length; i++) {
        const { status, body } = await getRequest(`https://api-gateway.pharmacity.vn/api/category?slug=${categories[i].slug}`);
        const productCategory = status === 200 ? body.data.products.edges : [];
        const slugProduct: string[] = [];
        productCategory.forEach((item: any) => {
            slugProduct.push(item.node.slug);
        });
        const data: IProduct = { category: { slug: categories[i].slug }, products: [] };
        for (let j = 0; j < slugProduct.length; j++) {
            const result = await getRequest(`https://api-gateway.pharmacity.vn/api/product?slug=${slugProduct[j]}`);
            if (result.status === 200) {
                const productDetai = result.body.data.product;
                const image: { url: string }[] = [];
                productDetai.images.forEach((item: any) => {
                    image.push({ url: item.url });
                })
                data.products.push({
                    name: productDetai.name,
                    longDescription: productDetai.longDescription,
                    description: productDetai.description,
                    slug: productDetai.slug,
                    salePrice: productDetai.pricing?.priceRange?.start.gross.amount,
                    price: productDetai.pricing?.priceRangeUndiscounted.start.gross.amount,
                    images: image
                })
            }
        }
        console.log(data)
        fs.appendFileSync(`assets/products-${i}.txt`, JSON.stringify(data)
            + ",", 'utf8');
    }
}
function getRequest(url: string) {
    return new Promise<{ status: number, body: any }>((resolve, reject) => {
        axios
            .get(url)
            .then(response => {
                resolve({ status: response.status, body: response.data })
            }
            )
            .catch(error => {
                reject(error)
            })
    })
}

main()