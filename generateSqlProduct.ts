import fs from "fs";
import getRequest from "./api";
const main = async() => {
    let j = 1;
    let imageIndex = 1;
    for(let i = 1;i < 210; i++) {
        let data:any =  fs.readFileSync(`./assets/products-${i}.txt`, 'utf-8');
        const {category, products} = JSON.parse(data.split("").slice(0, data.split("").length -1 ).join(""));
        for(let a = 0; a < products.length;a++) {
            const sql = `
            INSERT INTO drug.products(id,name,price,sale_price,description,long_description,slug)
            VALUES
            (${j},
            "${products[a].name?.replace(/"/g, "'")}}",
            "${products[a].price}",
            "${products[a].salePrice}",
            "${products[a].description?.replace(/"/g, "'")}}",
            "${products[a].longDescription?.replace(/"/g, "'")}",
            "${products[a].slug}");\n`
            fs.appendFileSync('./assets/latest/products.sql', sql);
            
            products[a].images.forEach((image:any) =>{
                const sqlImage = `
                INSERT INTO drug.images (id,url,product_id)
                VALUES
                (${imageIndex},
                "${image.url}",
                ${j});\n`
                fs.appendFileSync('./assets/latest/images.sql', sqlImage);
                imageIndex++;
            })
            const {status, body} = await getRequest(`http://localhost:8082/v1/category?slug=${category.slug}`);
            const categoryLevel = status === 200 ? body : [];
            if(categoryLevel.length > 0) {
                categoryLevel.forEach((item:any) => {
                const sqlCategoryProduct = `INSERT INTO drug.product_category
                (product_id,category_id)
                VALUES (${j},${item.id});\n`
                fs.appendFileSync('./assets/latest/category-product.sql', sqlCategoryProduct);
            })
            }
           
            j++;
        }
    }
   
}
main()