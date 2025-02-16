import cn from 'classnames'
import type {
  GetServerSidePropsContext,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
  InferGetStaticPropsType
} from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getConfig } from '@bigcommerce/storefront-data-hooks/api'
import getAllPages from '@bigcommerce/storefront-data-hooks/api/operations/get-all-pages'
import getSiteInfo from '@bigcommerce/storefront-data-hooks/api/operations/get-site-info'
import useSearch from '@bigcommerce/storefront-data-hooks/products/use-search'
import { Layout } from '@components/common'
import { Container, Skeleton, Text } from '@components/ui'

import rangeMap from '@lib/range-map'
import getSlug from '@lib/get-slug'
import { filterQuery, getCategoryPath, useSearchMeta } from '@lib/search'
import ProductsTable from '@components/common/ProductsTable'
import getPage from '@bigcommerce/storefront-data-hooks/api/operations/get-page'
import DPLTable from '@components/common/DPLTable'

export async function getServerSideProps ({
  query,
  preview,
  locale
}: GetServerSidePropsContext) {
  const config = getConfig({ locale })
  const { pages } = await getAllPages({ config, preview })
  const { categories, brands } = await getSiteInfo({ config, preview })

  const pageItem = pages.find((p) =>
    p.url ? getSlug(p.url) === 'en-US/digital-pre-lams' : false
  )
  const d =
    pageItem &&
    (await getPage({ variables: { id: pageItem.id! }, config, preview }))
  const page = d?.page

  let search = ''
  if (query.q) {
    search = `&keyword=${query.q}`
  }
  const categoriesFilter = `&categories=${
    categories.find((c) => getSlug(c.path) === 'dpl')?.entityId
  }`
  const { data } = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.STORE_HASH}/v3/catalog/products?include=custom_fields${search}${categoriesFilter}`,
    {
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'x-auth-token': process.env.ACCESS_TOKEN
      }
    }
  ).then((r) => r.json())

  return {
    props: { page, categories, brands, data }
  }
}

export default function DPL ({
  page,
  categories,
  brands,
  data: p
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const { asPath } = router
  const { q, sort } = router.query
  // `q` can be included but because categories and designers can't be searched
  // in the same way of products, it's better to ignore the search input if one
  // of those is selected
  const query = filterQuery({ sort })

  const { category, brand } = useSearchMeta(asPath)
  const activeCategory = categories.find(
    (cat) => getSlug(cat.path) === category
  )
  const activeBrand = brands.find(
    (b) => getSlug(b.node.path) === `brands/${brand}`
  )?.node

  const { data } = useSearch({
    search: typeof q === 'string' ? q : '',
    categoryId: activeCategory?.entityId,
    brandId: activeBrand?.entityId,
    sort: typeof sort === 'string' ? sort : ''
  })

  return (
    <Container>
      <div className="max-w mx-auto py-6">
        {page?.body && <Text html={page.body} />}
      </div>
      <div className="grid grid-cols-12 gap-4 mt-3 mb-20">
        <div className="col-span-2">
          <ul className="mb-10">
            {/* <li className="py-1 text-base font-bold tracking-wide">
              <Link href={{ pathname: getCategoryPath('', brand), query }}>
                <a>All Categories</a>
              </Link>
            </li> */}
            {categories.map((cat) => (
              <li
                key={cat.path}
                className={cn('py-1 text-accents-8', {
                  underline: activeCategory?.entityId === cat.entityId
                })}
              >
                <Link
                  href={{
                    pathname: getCategoryPath(cat.path, brand),
                    query
                  }}
                >
                  <a>{cat.name}</a>
                </Link>
              </li>
            ))}
          </ul>
          {/* <ul>
            <li className="py-1 text-base font-bold tracking-wide">
              <Link href={{ pathname: getDesignerPath('', category), query }}>
                <a>All Vendors</a>
              </Link>
            </li>
            {brands.flatMap(({ node }) => (
              <li
                key={node.path}
                className={cn('py-1 text-accents-8', {
                  underline: activeBrand?.entityId === node.entityId
                })}
              >
                <Link
                  href={{
                    pathname: getDesignerPath(node.path, category),
                    query
                  }}
                >
                  <a>{node.name}</a>
                </Link>
              </li>
            ))}
          </ul> */}
        </div>
        <div className="col-span-10">
          {(q || activeCategory || activeBrand) && (
            <div className="mb-12 transition ease-in duration-75">
              {data
                ? (
                <>
                  <span
                    className={cn('animated', {
                      fadeIn: data.found,
                      hidden: !data.found
                    })}
                  >
                    Showing {p.length} results{' '}
                    {q && (
                      <>
                        for "<strong>{q}</strong>"
                      </>
                    )}
                  </span>
                  <span
                    className={cn('animated', {
                      fadeIn: !data.found,
                      hidden: data.found
                    })}
                  >
                    {q
                      ? (
                      <>
                        There are no products that match "<strong>{q}</strong>"
                      </>
                        )
                      : (
                      <>
                        There are no products that match the selected category
                      </>
                        )}
                  </span>
                </>
                  )
                : q
                  ? (
                <>
                  Searching for: "<strong>{q}</strong>"
                </>
                    )
                  : (
                <>Searching...</>
                    )}
            </div>
          )}

          {data
            ? (
            <DPLTable data={p} categories={categories} />
              )
            : (
            <div className="flex-1">
              {rangeMap(12, (i) => (
                <Skeleton
                  key={i}
                  className="w-full animated fadeIn"
                  height={325}
                />
              ))}
            </div>
              )}
        </div>
        {/* <div className="col-span-2">
          <ul>
            <li className="py-1 text-base font-bold tracking-wide">Sort</li>
            <li
              className={cn('py-1 text-accents-8', {
                underline: !sort
              })}
            >
              <Link href={{ pathname, query: filterQuery({ q }) }}>
                <a>Relevance</a>
              </Link>
            </li>
            {SORT.map(([key, text]) => (
              <li
                key={key}
                className={cn('py-1 text-accents-8', {
                  underline: sort === key
                })}
              >
                <Link href={{ pathname, query: filterQuery({ q, sort: key }) }}>
                  <a>{text}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div> */}
      </div>
    </Container>
  )
}

DPL.Layout = Layout
