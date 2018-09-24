/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path')

exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions

    let allProducts = []

    const getMoreProducts = async function (currentCursor) {
        const productsCache = await graphql(`
            query getAllProducts($previousProduct: String!) {
                shopify {
                    shop {
                        products(first: 20, after: $previousProduct) {
                            edges {
                                cursor
                                node {
                                    handle
                                }
                            }
                            pageInfo {
                                hasNextPage
                            }
                        }
                    }
                }
            }
            `,
            {
                "previousProduct": currentCursor,
            }
        )

        // add returned paginated products to all products
        allProducts = allProducts.concat(productsCache.data.shopify.shop.products.edges)

        if (productsCache.data.shopify.shop.products.pageInfo.hasNextPage) {
            await getMoreProducts(currentCursor = productsCache.data.shopify.shop.products.edges[productsCache.data.shopify.shop.products.edges.length - 1].cursor)
        }
    }

    const productsCache = await graphql(`
    {
        shopify {
            shop {
                products(first: 20) {
                    edges {
                        cursor
                        node {
                            handle
                        }
                    }
                    pageInfo {
                        hasNextPage
                    }
                }
            }
        }
    }
    `)

    // add returned paginated products to all products
    allProducts = allProducts.concat(productsCache.data.shopify.shop.products.edges)

    // if there's more products, grab next 250 products
    if (productsCache.data.shopify.shop.products.pageInfo.hasNextPage) {
        await getMoreProducts(currentCursor = productsCache.data.shopify.shop.products.edges[productsCache.data.shopify.shop.products.edges.length - 1].cursor)
    }

    allProducts.forEach(product => {
        createPage({
            path: `/products/${product.node.handle}`,
            component: path.resolve('./src/templates/product.js'),
            context: {
                handle: product.node.handle,
            },
        })
    })

//     const collections = await graphql(`
//     {
//       allShopifyCollection {
//         edges {
//           node {
//             id
//             handle
//           }
//         }
//       }
//     }
//   `)

//     collections.data.allShopifyCollection.edges.forEach(edge => {
//         createPage({
//             path: `/collections/${edge.node.handle}`,
//             component: path.resolve('./src/templates/collection.js'),
//             context: {
//                 id: edge.node.id,
//             },
//         })
//     })
}